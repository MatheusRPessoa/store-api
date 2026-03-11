import { AuthHelper } from '../../../tests/helpers/auth.helper';
import fetch from 'node-fetch';
import { ProductResponseDto } from '../../dto/products-response.dto';

const PRODUCTS_ENDPOINT = '/products';

export async function createProduct(): Promise<ProductResponseDto> {
  const payload = {
    NOME: 'Produto Teste',
    DESCRICAO: 'Descricao teste',
    PRECO: 10.99,
    QUANTIDADE: 5, // make sure this is a number, not string
  };

  const response = await fetch(`http://localhost:3000${PRODUCTS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...AuthHelper.getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  // cast the JSON to ProductResponseDto
  const data = (await response.json()) as ProductResponseDto;
  console.log('Resposta do endpoint: ', data);

  return data;
}
