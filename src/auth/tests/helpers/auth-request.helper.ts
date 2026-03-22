import { ApiResponse } from 'src/tests/helpers/api-response.helper';
import { AuthHelper } from './auth.helper';

const BASE_URL = 'http://localhost:3000';
const AUTH_ENDPOINT = '/auth';

export interface AuthData {
  access_token: string;
  refresh_token: string;
}

export async function login(
  username = 'admin',
  password = 'admin123',
): Promise<{ status: number; ok: boolean; body: ApiResponse<AuthData> }> {
  const response = await fetch(`${BASE_URL}${AUTH_ENDPOINT}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = (await response.json()) as ApiResponse<AuthData>;
  console.log('Resposta do login: ', data);

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function refresh(
  authenticate = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<AuthData> }> {
  const response = await fetch(`${BASE_URL}${AUTH_ENDPOINT}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authenticate ? AuthHelper.getRefreshHeader() : {}),
    },
  });

  const data = (await response.json()) as ApiResponse<AuthData>;
  console.log('Resposta do refresh: ', data);

  return {
    status: response.status,
    ok: response.ok,
    body: data,
  };
}

export async function logout(
  authenticate = true,
): Promise<{ status: number; ok: boolean; body: ApiResponse<null> }> {
  const response = await fetch(`${BASE_URL}${AUTH_ENDPOINT}/logout`, {
    method: 'POST',
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
