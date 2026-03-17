import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import {
  cleanupAll,
  createProduct,
  initTestDataSource,
} from './helpers/product.helper';
import { AppDataSource } from '../../../config/database/data-source';

describe('POST /products', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
  });

  describe('Success', () => {
    it('should return 201 when creating a product with valid data', async () => {
      const response = await createProduct();

      expect(response.body.succeeded).toBe(true);
      expect(response.body.data?.NOME).toBe('Produto Teste');
    });
  });

  describe('Failure', () => {
    it('should return 400 when creating a product with duplication name', async () => {
      await createProduct();

      const response = await createProduct();

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toContain('já existe');
    });

    it('should return 401 when user not authenticated', async () => {
      const response = await createProduct({}, false);

      expect(response.status).toBe(401);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 400 when name is not provided', async () => {
      const response = await createProduct({
        NOME: undefined,
      });

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
    });

    it('should return 400 when name is empry', async () => {
      const response = await createProduct({
        NOME: '',
      });

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
    });
  });
});
