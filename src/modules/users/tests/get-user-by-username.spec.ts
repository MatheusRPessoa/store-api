import { AppDataSource } from '../../../config/database/data-source';
import {
  cleanupAll,
  createUser,
  getUserByUsername,
  initTestDataSource,
} from './helpers/user.helper';
import { AuthHelper } from '../../../auth/tests/helpers/auth.helper';

describe('GET /users/username/:username', () => {
  beforeAll(async () => {
    await AppDataSource.initialize();
    initTestDataSource(AppDataSource);
    await AuthHelper.setup(AppDataSource);
  });

  afterAll(async () => {
    await cleanupAll();
  });

  beforeEach(async () => {
    await cleanupAll();
  });

  it('should return a user by username', async () => {
    const username = 'user-username-test';

    await createUser({
      username,
      email: 'username@test.com',
    });

    const response = await getUserByUsername(username);

    expect(response.status).toBe(200);
    expect(response.body.succeeded).toBe(true);
    expect(response.body.data!.NOME_USUARIO).toBe(username);
  });

  it('should return 404 whem username does not exist', async () => {
    const response = await getUserByUsername('notexistent-user-xyz');

    expect(response.status).toBe(404);
    expect(response.body.succeeded).toBe(false);
  });

  it('should return 401 when user not authenticated', async () => {
    const response = await getUserByUsername('user-username-test', false);

    expect(response.status).toBe(401);
    expect(response.body.succeeded).toBe(false);
  });

  it('should return 400 when username is invalid', async () => {
    const response = await getUserByUsername('ab');

    expect(response.status).toBe(400);
    expect(response.body.succeeded).toBe(false);
  });
});
