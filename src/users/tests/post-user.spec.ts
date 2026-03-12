import { AppDataSource } from '../../config/database/data-source';
import {
  cleanupAll,
  createUser,
  initTestDataSource,
} from './helpers/user.helper';
import { AuthHelper } from '../../auth/tests/helpers/auth.helper';
import { ApiResponse } from '../../tests/helpers/api-response.helper';

interface UserData {
  ID: number;
  NOME_USUARIO: string;
  STATUS: string;
  CRIADO_EM: Date | null;
}

describe('POST /users', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
  });

  describe('Success', () => {
    it('should return 201 when creating a user with valid data', async () => {
      const response = await createUser({
        username: 'test',
        email: 'test@test.com',
      });

      expect(response.body.succeeded).toBe(true);
      expect(response.body.data?.NOME_USUARIO).toBe('test');
    });
  });

  describe('Failure', () => {
    it('should return 400 when creating a user with duplicate username', async () => {
      await createUser({
        username: 'duplicate-test',
        email: 'duplicate@test.com',
      });

      const response = await createUser({
        username: 'duplicate-test',
        email: 'different@test.com',
      });

      expect(response.status).toBe(400);
      expect(response.body.succeeded).toBe(false);
      expect(response.body.message).toBe('Usuário já existe');
    });

    it('should return 401 when user not authenticated', async () => {
      const response = await fetch(`http://localhost:3000/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'test',
          password: '123456',
          email: 'test@test.com',
        }),
      });

      const body = (await response.json()) as ApiResponse<UserData>;

      expect(response.status).toBe(401);
      expect(body.succeeded).toBe(false);
    });
  });
});
