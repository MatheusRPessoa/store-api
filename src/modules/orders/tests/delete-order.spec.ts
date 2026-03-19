import { AppDataSource } from '../../../config/database/data-source';
import {
  cancelOrder,
  cleanupAll,
  initTestDataSource,
} from './helpers/order.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { OrderFactory } from './helpers/order.factory';

describe('PATH /orders/:id/cancel', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  beforeEach(async () => {
    await cleanupAll();
  });

  describe('Success', () => {
    it('should return 200 and cancel the order', async () => {
      const order = await OrderFactory.create();

      const response = await cancelOrder(order.ID);

      expect(response.status).toBe(200);
      expect(response.body.succeeded).toBe(true);
      expect(response.body.message).toBe('Pedido cancelado com sucesso');
    });
  });

  describe('Error', () => {
    it('should return 404 when order does not exist', async () => {
      const fakeId = 9999999;

      const response = await cancelOrder(fakeId);

      expect(response.status).toBe(404);
      expect(response.body.succeeded).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      const order = await OrderFactory.create();

      const response = await cancelOrder(order.ID, false);

      expect(response.status).toBe(401);
      expect(response.body.succeeded).toBe(false);
    });

    it('should return 400 when order is already canceled', async () => {
      const order = await OrderFactory.create();

      await cancelOrder(order.ID);
      const response = await cancelOrder(order.ID);

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
    });
  });
});
