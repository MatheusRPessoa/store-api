import { AppDataSource } from '../../config/database/data-source';
import { AuthHelper } from './helpers/auth.helper';
import { login, logout, refresh } from './helpers/auth-request.helper';
import { ApiResponse } from 'src/tests/helpers/api-response.helper';
import type { AuthData } from './helpers/auth-request.helper';

describe('AUTH', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('POST /auth/login', () => {
    afterEach(async () => {
      await AuthHelper.authenticate();
    });

    describe('Success', () => {
      it('should return 201 with access_token and refresh_token', async () => {
        const response = await login();

        expect(response.status).toBe(201);
        expect(response.body.succeeded).toBe(true);
        expect(response.body.data?.access_token).toBeDefined();
        expect(response.body.data?.refresh_token).toBeDefined();
        expect(response.body.message).toContain('Login realizado com sucesso');
      });
    });

    describe('Failure', () => {
      it('should return 401 when password is incorrect', async () => {
        const response = await login('admin', 'senha-errada');

        expect(response.status).toBe(401);
        expect(response.body.succeeded).toBe(false);
        expect(response.body.message).toContain('Credenciais inválidas');
      });

      it('should return 404 when user does not exist', async () => {
        const response = await login('usuario-inexistente', 'admin123');

        expect(response.status).toBe(404);
        expect(response.body.succeeded).toBe(false);
        expect(response.body.message).toContain(
          '"usuario-inexistente" não encontrado',
        );
      });

      it('should return 400 when username is not provided', async () => {
        const response = await login('', 'admin123');

        expect(response.status).toBe(400);
        expect(response.body.succeeded).toBe(false);
        expect(response.body.message).toContain('username é obrigatório');
      });

      it('should return 400 when password is not provided', async () => {
        const response = await login('admin', '');

        expect(response.status).toBe(400);
        expect(response.body.succeeded).toBe(false);
        expect(response.body.message).toContain('senha é obrigatória');
      });
    });
  });

  describe('POST /auth/refresh', () => {
    describe('Success', () => {
      it('should return 201 with new access_token and refresh_token', async () => {
        const response = await refresh();

        expect(response.status).toBe(201);
        expect(response.body.succeeded).toBe(true);
        expect(response.body.data?.access_token).toBeDefined();
        expect(response.body.data?.refresh_token).toBeDefined();
        expect(response.body.message).toContain('Token atualizado');
      });

      it('should return a different access_token after refresh', async () => {
        const previousAccessToken = AuthHelper.getAuthHeader().Authorization;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await refresh();

        expect(response.status).toBe(201);
        expect(`Bearer ${response.body.data?.access_token}`).not.toBe(
          previousAccessToken,
        );
      });
    });

    describe('Failure', () => {
      it('should return 401 when no refresh_token is provided', async () => {
        const response = await refresh(false);

        expect(response.status).toBe(401);
        expect(response.body.succeeded).toBe(false);
        expect(response.body.message).toBe('Unauthorized');
      });

      it('should return 401 when refresh token is invalid', async () => {
        const response = await fetch('http://localhost:3000/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token-invalido',
          },
        });

        const data = (await response.json()) as ApiResponse<AuthData>;

        expect(response.status).toBe(401);
        expect(data.succeeded).toBe(false);
      });
    });
  });

  describe('POST /auth/logout', () => {
    describe('Success', () => {
      it('should return 201 when logging out', async () => {
        const response = await logout();

        expect(response.status).toBe(201);
        expect(response.body.succeeded).toBe(true);
        expect(response.body.data).toBe(null);
        expect(response.body.message).toContain('Logout realizado');
      });

      it('should be invalidate refresh token after logout', async () => {
        await logout();

        const response = await refresh();

        expect(response.status).toBe(401);
        expect(response.body.succeeded).toBe(false);
        expect(response.body.message).toContain('Acesso negado');
      });
    });

    describe('Failure', () => {
      it('should return 401 when user is not authenticated', async () => {
        const response = await logout(false);

        expect(response.status).toBe(401);
        expect(response.body.succeeded).toBe(false);
        expect(response.body.message).toContain('Unauthorized');
      });
    });
  });
});
