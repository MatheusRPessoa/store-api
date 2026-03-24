import { AppDataSource } from '../../../config/database/data-source';
import {
  cleanupAll,
  createProduct,
  getProductById,
  initTestDataSource,
} from './helpers/product.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { ApiResponse } from 'src/tests/helpers/api-response.helper';

interface ProductData {
  ID: number;
  NOME: string;
  DESCRICAO: string;
  PRECO: number;
  QUANTIDADE: number;
  STATUS: string;
  CRIADO_EM: Date | null;
}

describe('GET /products/:id', () => {
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

  it('should return a user by id', async () => {
    const created = await createProduct();

    const response = await getProductById(created.body.data!.ID);

    expect(response.status).toBe(200);
    expect(response.body.succeeded).toBe(true);
    expect(response.body.data!.ID).toBe(created.body.data?.ID);
  });

  it('should return 404 when user does not exist', async () => {
    const response = await getProductById(999999);

    expect(response.status).toBe(404);
    expect(response.body.succeeded).toBe(false);
  });

  it('should return 401 when user not authenticated', async () => {
    const response = await getProductById(1, false);

    expect(response.status).toBe(401);
    expect(response.body.succeeded).toBe(false);
  });

  it('should return 400 when id is not a number', async () => {
    const response = await fetch(`http://localhost:3000/products/abc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...AuthHelper.getAuthHeader(),
      },
    });

    const body = (await response.json()) as ApiResponse<ProductData>;

    expect(response.status).toBe(400);
    expect(body.succeeded).toBe(false);
  });
});
