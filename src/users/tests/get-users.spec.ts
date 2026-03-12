import { AppDataSource } from '../../config/database/data-source';
import {
  cleanupAll,
  createUser,
  getAllUsers,
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

describe('GET /users', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
  });

  it('should return all users', async () => {
    await createUser({ username: 'user1', email: 'user1@test.com' });
    await createUser({ username: 'user2', email: 'user2@test.com' });

    const response = await getAllUsers();

    expect(response.body.succeeded).toBe(true);
    expect(response.body.data!.length).toBeGreaterThanOrEqual(2);
  });

  it('should return 401 when user not authenticated', async () => {
    const response = await fetch(`http://localhost:3000/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = (await response.json()) as ApiResponse<UserData>;

    expect(response.status).toBe(401);
    expect(body.succeeded).toBe(false);
  });
});
