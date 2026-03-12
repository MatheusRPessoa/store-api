import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';
import fetch from 'node-fetch';
import { ProductResponseDto } from '../../dto/products-response.dto';
import { DataSource } from 'typeorm';
import { ProductEntity } from '../../../products/entities/product.entity';

const PRODUCTS_ENDPOINT = '/products';

let dataSource: DataSource;

export function initTestDataSource(ds: DataSource) {
  dataSource = ds;
}

export async function createProduct(): Promise<ProductResponseDto> {
  const payload = {
    NOME: 'Produto Teste',
    DESCRICAO: 'Descricao teste',
    PRECO: 10.99,
    QUANTIDADE: 5,
  };

  const response = await fetch(`http://localhost:3000${PRODUCTS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...AuthHelper.getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ProductResponseDto;
  console.log('Resposta do endpoint: ', data);

  return data;
}

export async function cleanupAll() {
  if (!dataSource) {
    throw new Error(
      'DataSource não inicializado. Rode initTestDataSource antes.',
    );
  }

  await dataSource.getRepository(ProductEntity).clear();
}
