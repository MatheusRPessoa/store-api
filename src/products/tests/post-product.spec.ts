import { AuthHelper } from '../../auth/tests/helpers/auth.helper';
import {
  cleanupAll,
  createProduct,
  initTestDataSource,
} from './helpers/product.helper';
import { ProductResponseDto } from '../dto/products-response.dto';
import { AppDataSource } from '../../config/database/data-source';

describe('POST /products', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await cleanupAll();
    await AuthHelper.authenticate();
  });

  describe('Success', () => {
    it('should return 201 when creating a product with valid data', async () => {
      const body: ProductResponseDto = await createProduct();

      expect(body.succeeded).toBe(true);
    });
  });
});
