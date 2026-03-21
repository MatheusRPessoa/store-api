import { AppDataSource } from '../../../config/database/data-source';
import {
  cleanupAll,
  createOrder,
  initTestDataSource,
  payOrder,
} from './helpers/payment.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

describe('POST /orders/:id/pay', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterEach(async () => {
    await cleanupAll();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('Success', () => {
    it('should return 200 and payment data when paying with PIX', async () => {
      const order = await createOrder({ TOTAL: 150.0 });

      const response = await payOrder(order.ID, {
        method: PaymentMethodEnum.PIX,
      });

      expect(response.status).toBe(200);
      expect(response.body.succeeded).toBe(true);
      expect(response.body.data?.orderId).toBe(order.ID);
      expect(response.body.data?.status).toBe('ATIVO');
      expect(response.body.data?.payment.method).toBe(PaymentMethodEnum.PIX);
      expect(response.body.data?.payment.amount).toBe(150.0);
      expect(response.body.data?.payment.status).toBe(
        PaymentStatusEnum.APROVADO,
      );
    });

    it('should return 200 and payment data when paying with CARD', async () => {
      const order = await createOrder({ TOTAL: 200 });

      const response = await payOrder(order.ID, {
        method: PaymentMethodEnum.CARD,
      });

      expect(response.status).toBe(200);
      expect(response.body.succeeded).toBe(true);
      expect(response.body.data?.payment.method).toBe(PaymentMethodEnum.CARD);
      expect(response.body.data?.payment.amount).toBe(200.0);
    });
  });

  describe('Failure', () => {
    it('should return 404 when order does not exist', async () => {
      const response = await payOrder(999999, {
        method: PaymentMethodEnum.PIX,
      });

      expect(response.status).toBe(404);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toContain('não encontrado');
    });

    it('should return 400 when method is already paid', async () => {
      const order = await createOrder();

      await payOrder(order.ID, { method: PaymentMethodEnum.PIX });
      const response = await payOrder(order.ID, {
        method: PaymentMethodEnum.PIX,
      });

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toContain('já foi pago');
    });

    it('should return 400 when method is not provided', async () => {
      const order = await createOrder();

      const response = await payOrder(order.ID, { method: undefined });

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
    });

    it('should return 400 when method is invalid', async () => {
      const order = await createOrder();

      const response = await payOrder(order.ID, {
        method: 'INVALID' as PaymentMethodEnum,
      });

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
    });

    it('should return 401 when user is not authenticated', async () => {
      const order = await createOrder();

      const response = await payOrder(
        order.ID,
        {
          method: PaymentMethodEnum.PIX,
        },
        false,
      );

      expect(response.status).toBe(401);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });
});
