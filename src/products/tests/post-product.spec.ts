import { AuthHelper } from '../../tests/helpers/auth.helper';
import { createProduct } from './helpers/product.helper';
import { ProductResponseDto } from '../dto/products-response.dto';

describe('POST /products', () => {
  beforeAll(async () => {
    await AuthHelper.authenticate();
  });

  describe('Success', () => {
    it('should return 201 when creating a product with valid data', async () => {
      const body: ProductResponseDto = await createProduct();

      expect(body.succeeded).toBe(true);
    });
  });
});
