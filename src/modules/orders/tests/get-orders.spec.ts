import { AppDataSource } from '../../../config/database/data-source';
import {
  cleanupAll,
  getAllOrders,
  initTestDataSource,
} from './helpers/order.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { OrderFactory } from './helpers/order.factory';

describe('GET /orders', () => {
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

  it('should return 200 and list orders', async () => {
    await OrderFactory.create();

    const response = await getAllOrders();

    expect(response.status).toBe(200);
    expect(response.body.succeeded).toBe(true);
    expect(response.body.data?.length).toBeGreaterThan(0);
  });

  describe('Failure', () => {
    it('should return 404 when no orders exist', async () => {
      const response = await getAllOrders();

      expect(response.status).toBe(404);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await getAllOrders(false);

      expect(response.status).toBe(401);
    });
  });
});
