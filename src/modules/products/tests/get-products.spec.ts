import { ApiResponse } from 'src/tests/helpers/api-response.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { AppDataSource } from '../../../config/database/data-source';
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
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await cleanupAll();
  });

  it('should return all products', async () => {
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

  it('should return 200', async () => {
    const response = await getAllProducts();

    expect(response.status).toBe(200);
  });

  it('should return created products', async () => {
    await createProduct({
      NOME: 'Produto A',
      DESCRICAO: 'Descricao A',
      PRECO: 15,
      QUANTIDADE: 2,
    });

    const response = await getAllProducts();

    const names = response.body.data!.map((p: ProductData) => p.NOME);

    expect(names).toContain('Produto A');
  });

  it('should return empry array when there are no products', async () => {
    const response = await getAllProducts();

    expect(response.body.succeeded).toBe(true);
    expect(response.body.data).toEqual([]);
  });

  it('should return product with correct structure', async () => {
    await createProduct({
      NOME: 'Produto Estrutura',
      DESCRICAO: 'Descricao estrutura',
      PRECO: 20.5,
      QUANTIDADE: 3,
    });

    const response = await getAllProducts();

    const product = response.body.data![0];

    expect(product).toHaveProperty('ID');
    expect(product).toHaveProperty('NOME');
    expect(product).toHaveProperty('DESCRICAO');
    expect(product).toHaveProperty('PRECO');
    expect(product).toHaveProperty('QUANTIDADE');
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
