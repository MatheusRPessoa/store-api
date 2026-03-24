import { ProductEntity } from '../../../../modules/products/entities/product.entity';
import { AuthHelper } from '../../../../auth/tests/helpers/auth.helper';
import { OrderItemEntity } from '../../../../modules/orders/entities/order-item.entity';
import { OrderEntity } from '../../../../modules/orders/entities/order.entity';
import { ApiResponse } from '../../../../tests/helpers/api-response.helper';
import { DataSource } from 'typeorm';

const ORDERS_ENDPOINT = '/orders';
const BASE_URL = 'http://localhost:3000';

let dataSource: DataSource;

export interface OrderItemData {
  ID: number;
  ID_PRODUTO: number;
  QUANTIDADE: number;
  PRECO: number;
}

export interface OrderData {
  ID: number;
  TOTAL: number;
  ITEMS: OrderItemData[];
  CRIADO_EM: Date | null;
  CRIADO_POR: string;
}

export function initTestDataSource(ds: DataSource) {
  dataSource = ds;
}

export async function createOrder(
  items: { ID_PRODUTO: number; QUANTIDADE: number }[],
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<OrderData> }> {
  const payload = {
    ITEMS: items,
  };

  const response = await fetch(`${BASE_URL}${ORDERS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ApiResponse<OrderData>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getAllOrders(
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<OrderData[]> }> {
  const response = await fetch(`${BASE_URL}${ORDERS_ENDPOINT}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
  });

  const data = (await response.json()) as ApiResponse<OrderData[]>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getOrderById(
  id: number,
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<OrderData> }> {
  const response = await fetch(`${BASE_URL}${ORDERS_ENDPOINT}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
  });

  const data = (await response.json()) as ApiResponse<OrderData>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function cancelOrder(
  id: number,
  authenticate = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<null> }> {
  const response = await fetch(`${BASE_URL}${ORDERS_ENDPOINT}/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticate ? AuthHelper.getAuthHeader() : {}),
    },
  });

  const data = (await response.json()) as ApiResponse<null>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function cleanupAll() {
  if (!dataSource) {
    throw new Error(
      'DataSource não inicializa. Rode initTestDataSource antes.',
    );
  }

  const orderItemRepo = dataSource.getRepository(OrderItemEntity);
  const orderRepo = dataSource.getRepository(OrderEntity);
  const productRepo = dataSource.getRepository(ProductEntity);

  // ordem IMPORTANTE (FK)
  await orderItemRepo.createQueryBuilder().delete().execute();
  await orderRepo.createQueryBuilder().delete().execute();
  await productRepo.createQueryBuilder().delete().execute();
}
