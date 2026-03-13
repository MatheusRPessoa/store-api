import { ApiResponse } from 'src/tests/helpers/api-response.helper';
import { AuthHelper } from '../../auth/tests/helpers/auth.helper';
import { AppDataSource } from '../../config/database/data-source';
import {
  cleanupAll,
  createProduct,
  getAllProducts,
  initTestDataSource,
} from './helpers/product.helper';

interface ProductData {
  ID: number;
  NOME: string;
  DESCRICAO: string;
  PRECO: number;
  QUANTIDADE: number;
  STATUS: string;
  CRIADO_EM: Date | null;
}

describe('GET /products', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
  });

  it('should return all users', async () => {
    await createProduct({
      NOME: 'Produto Teste 1',
      DESCRICAO: 'Descricao teste 2',
      PRECO: 10.99,
      QUANTIDADE: 5,
    });

    await createProduct({
      NOME: 'Produto Teste 2',
      DESCRICAO: 'Descricao teste 2',
      PRECO: 10.99,
      QUANTIDADE: 5,
    });

    const response = await getAllProducts();

    expect(response.body.succeeded).toBe(true);
    expect(response.body.data!.length).toBeGreaterThanOrEqual(2);
  });

  it('should return 401 when user not authenticated', async () => {
    const response = await fetch(`http://localhost:3000/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = (await response.json()) as ApiResponse<ProductData>;

    expect(response.status).toBe(401);
    expect(body.succeeded).toBe(false);
  });
});
