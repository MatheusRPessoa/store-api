import { AuthHelper } from '../../../../auth/tests/helpers/auth.helper';
import { UserEntity } from '../../entities/user.entity';
import { DataSource } from 'typeorm';
import { ApiResponse } from 'src/tests/helpers/api-response.helper';

const USERS_ENDPOINT = '/users';
const BASE_URL = 'http://localhost:3000';

let dataSource: DataSource;

interface UserData {
  ID: number;
  NOME_USUARIO: string;
  STATUS: string;
  CRIADO_EM: Date | null;
}

export function initTestDataSource(ds: DataSource) {
  dataSource = ds;
}

export async function createUser(
  overrides?: Partial<{
    username: string;
    password: string;
    email: string;
  }>,
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<UserData> }> {
  const payload = {
    username: overrides?.username ?? 'user-test',
    password: overrides?.password ?? 'admin123',
    email: overrides?.email ?? 'test@email.com.br',
  };

  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ApiResponse<UserData>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getAllUsers() {
  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...AuthHelper.getAuthHeader(),
    },
  });

  const data = (await response.json()) as ApiResponse<UserData[]>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getUserById(
  id: number,
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<UserData> }> {
  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticated ? AuthHelper.getAuthHeader() : {}),
    },
  });

  const data = (await response.json()) as ApiResponse<UserData>;

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function getUserByUsername(
  username: string,
  authenticated = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<UserData> }> {
  const response = await fetch(
    `${BASE_URL}${USERS_ENDPOINT}/username/${username}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authenticated ? AuthHelper.getAuthHeader() : {}),
      },
    },
  );

  const data = (await response.json()) as ApiResponse<UserData>;
  console.log('Resposta do endpoint: ', data);

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function deleteUser(id: number): Promise<void> {
  await fetch(`${BASE_URL}${USERS_ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...AuthHelper.getAuthHeader(),
    },
  });
}

export async function cleanupAll() {
  if (!dataSource) {
    throw new Error(
      'DataSource não inicializado. Rode initiTestDataSource antes',
    );
  }

  await dataSource.getRepository(UserEntity).clear();
}
