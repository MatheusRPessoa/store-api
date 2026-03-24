import { OrderEntity } from '../../../../modules/orders/entities/order.entity';
import { DataSource } from 'typeorm';
import { PaymentMethodEnum } from '../../enums/payment-method.enum';
import { ApiResponse } from '../../../../tests/helpers/api-response.helper';
import { AuthHelper } from '../../../../auth/tests/helpers/auth.helper';

const BASE_URL = 'http://localhost:3000';
const ORDERS_ENDPOINT = '/orders';

let dataSource: DataSource;

interface PaymentResponseData {
  orderId: number;
  status: string;
  payment: {
    status: string;
    method: string;
    amount: number;
  };
}

export function initTestDataSource(ds: DataSource) {
  dataSource = ds;
}

export async function createOrder(
  overrides?: Partial<{ TOTAL: number; USER_ID: number }>,
): Promise<OrderEntity> {
  if (!dataSource) {
    throw new Error('Datasource não inicializado. Rode initTestDataSource');
  }

  const repo = dataSource.getRepository(OrderEntity);

  const order = repo.create({
    USER_ID: overrides?.USER_ID ?? 1,
    TOTAL: overrides?.TOTAL ?? 150.0,
    CRIADO_POR: 'test',
  });

  return repo.save(order);
}

export async function payOrder(
  orderId: number,
  overrides?: Partial<{ method: PaymentMethodEnum }>,
  authenticated = true,
): Promise<{
  status: number;
  ok: boolean;
  body: ApiResponse<PaymentResponseData>;
}> {
  const payload = {
    method: overrides?.method,
  };

  const response = await fetch(`${BASE_URL}${ORDERS_ENDPOINT}/${orderId}/pay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ApiResponse<PaymentResponseData>;
  console.log(data);
  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function cleanupAll() {
  if (!dataSource) {
    throw new Error('Data source não iniciado. Rode initTestDataSource antes.');
  }

  await dataSource.query('DELETE FROM "PAGAMENTOS"');
  await dataSource.query('DELETE FROM "PEDIDOS" WHERE "CRIADO_POR" = \'test\'');
}
