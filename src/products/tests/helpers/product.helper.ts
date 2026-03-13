import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import { DataSource } from 'typeorm';
import { ProductEntity } from '../../../products/entities/product.entity';
import { ApiResponse } from 'src/tests/helpers/api-response.helper';

const PRODUCTS_ENDPOINT = '/products';
const BASE_URL = 'http://localhost:3000';

let dataSource: DataSource;

interface ProductData {
  ID: number;
  NOME: string;
  DESCRICAO: string;
  PRECO: number;
  QUANTIDADE: number;
  STATUS: string;
  CRIADO_EM: Date | null;
}

export function initTestDataSource(ds: DataSource) {
  dataSource = ds;
}

export async function createProduct(
  overrides?: Partial<{
    NOME: string;
    DESCRICAO: string;
    PRECO: number;
    QUANTIDADE: number;
  }>,
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<ProductData> }> {
  const payload = {
    NOME: overrides?.NOME ?? 'Produto Teste',
    DESCRICAO: overrides?.DESCRICAO ?? 'Descricao teste',
    PRECO: overrides?.PRECO ?? 10.99,
    QUANTIDADE: overrides?.QUANTIDADE ?? 5,
  };

  const response = await fetch(`${BASE_URL}${PRODUCTS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ApiResponse<ProductData>;
  console.log('Resposta do endpoint: ', data);

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getAllProducts(authenticated = true) {
  const response = await fetch(`${BASE_URL}${PRODUCTS_ENDPOINT}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
  });

  const data = (await response.json()) as ApiResponse<ProductData[]>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getProductById(
  id: number,
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<ProductData> }> {
  const response = await fetch(`${BASE_URL}${PRODUCTS_ENDPOINT}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
  });

  const data = (await response.json()) as ApiResponse<ProductData>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getProductByName(
  name: string,
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<ProductData[]> }> {
  const response = await fetch(
    `${BASE_URL}${PRODUCTS_ENDPOINT}/search/by-name?name=${name}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authenticated ? AuthHelper.getAuthHeader() : {}),
      },
    },
  );

  const data = (await response.json()) as ApiResponse<ProductData[]>;
  console.log(data);

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function cleanupAll() {
  if (!dataSource) {
    throw new Error(
      'DataSource não inicializado. Rode initTestDataSource antes.',
    );
  }

  await dataSource.getRepository(ProductEntity).clear();
}
