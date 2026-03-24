import { AppDataSource } from '../../../config/database/data-source';
import {
  cleanupAll,
  createProduct,
  getProductByName,
  initTestDataSource,
} from './helpers/product.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';

describe('GET /products/name/:name', () => {
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
  });

  it('should return a product by name', async () => {
    const name = 'product-name-test';

    await createProduct({
      NOME: 'product-name-test',
      PRECO: 10,
    });

    const response = await getProductByName(name);
    console.log(response);
  });

  it('should return 404 when product does not exist', async () => {
    const response = await getProductByName('notexistent-product-xyz');

    expect(response.status).toBe(404);
    expect(response.body.succeeded).toBe(false);
  });

  it('should return 401 when user not authenticated', async () => {
    const response = await getProductByName('product-name-test', false);

    expect(response.status).toBe(401);
    expect(response.body.succeeded).toBe(false);
  });

  it('should return 400 when name is invalid', async () => {
    const response = await getProductByName('ab');

    expect(response.status).toBe(400);
    expect(response.body.succeeded).toBe(false);
  });
});
