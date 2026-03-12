import { AppDataSource } from '../../config/database/data-source';
import {
  cleanupAll,
  createUser,
  getUserById,
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

describe('GET /users/:id', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
  });

  it('should return a user by id', async () => {
    const created = await createUser({
      username: 'user-id-test',
      email: 'id@test.com',
    });

    const id = created.body.data!.ID;

    const response = await getUserById(id);

    expect(response.body.succeeded).toBe(true);
    expect(response.body.data!.ID).toBe(id);
  });

  it('should return 404 when user does not exist', async () => {
    const response = await getUserById(999999);

    expect(response.status).toBe(404);
    expect(response.body.succeeded).toBe(false);
  });

  it('should return 401 when user not authenticated', async () => {
    const response = await fetch(`http://localhost:3000/users/1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const body = (await response.json()) as ApiResponse<UserData>;

    expect(response.status).toBe(401);
    expect(body.succeeded).toBe(false);
  });

  it('should return 400 when id is not a number', async () => {
    const response = await fetch(`http://localhost:3000/users/abc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...AuthHelper.getAuthHeader(),
      },
    });

    const body = (await response.json()) as ApiResponse<UserData>;

    expect(response.status).toBe(400);
    expect(body.succeeded).toBe(false);
  });
});
