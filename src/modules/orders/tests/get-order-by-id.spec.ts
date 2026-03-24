import { AppDataSource } from '../../../config/database/data-source';
import {
  cleanupAll,
  getOrderById,
  initTestDataSource,
} from './helpers/order.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { OrderFactory } from './helpers/order.factory';

describe('GET /orders/:id', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  beforeEach(async () => {
    await cleanupAll();
  });

  afterAll(async () => {
    await cleanupAll();
    await AppDataSource.destroy();
  });

  describe('Success', () => {
    it('should return 200 and the order', async () => {
      const order = await OrderFactory.create();

      const response = await getOrderById(order.ID);

      expect(response.status).toBe(200);
      expect(response.body.succeeded).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data?.ID).toBe(order.ID);
    });
  });

  describe('Error', () => {
    it('should return 404 when order does not exist', async () => {
      const fakeId = 999999999;

      const response = await getOrderById(fakeId);

      expect(response.status).toBe(404);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should return 401 when not authenticaded', async () => {
      const order = await OrderFactory.create();

      const response = await getOrderById(order.ID, false);

      expect(response.status).toBe(401);
      expect(response.body.succeeded).toBe(false);
    });
  });
});
