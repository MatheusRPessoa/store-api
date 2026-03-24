import { AppDataSource } from '../../../config/database/data-source';
import {
  cleanupAll,
  createOrder,
  initTestDataSource,
} from './helpers/order.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { NotFoundException } from '@nestjs/common';
import { ProductFactory } from '../../../modules/products/tests/helpers/product-factory.helper';

describe('POST /orders', () => {
  let productId: number;

  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await cleanupAll();

    const product = await ProductFactory.create();

    if (!product) {
      throw new NotFoundException('Product not created in test setup');
    }

    productId = product.ID;
  });

  describe('Success', () => {
    it('Should return 201 when creating an order with valid data', async () => {
      const response = await createOrder([
        {
          ID_PRODUTO: productId,
          QUANTIDADE: 1,
        },
      ]);

      expect(response.status).toBe(201);
      expect(response.body.succeeded).toBe(true);
      expect(response.body.data?.TOTAL).toBeGreaterThan(0);
      expect(response.body.data?.ITEMS.length).toBe(1);
    });
  });

  describe('Failure', () => {
    it('should return 400 when no items provided', async () => {
      const response = await createOrder([]);

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toBe(
        'O pedido deve conter pelo menos um item',
      );
    });

    it('should be 404 when product does not exist', async () => {
      const response = await createOrder([
        {
          ID_PRODUTO: 99999,
          QUANTIDADE: 1,
        },
      ]);

      expect(response.status).toBe(404);
      expect(response.body.succeeded).toBe(false);
    });

    it('should return 400 when insufficient stock', async () => {
      const response = await createOrder([
        {
          ID_PRODUTO: productId,
          QUANTIDADE: 99999,
        },
      ]);

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toContain('Estoque insuficiente');
    });

    it('should return 401 when user not authenticated', async () => {
      const response = await createOrder(
        [
          {
            ID_PRODUTO: productId,
            QUANTIDADE: 1,
          },
        ],
        false,
      );

      expect(response.status).toBe(401);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });
});
