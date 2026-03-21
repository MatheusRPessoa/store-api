import { AppDataSource } from '../../config/database/data-source';
import { AuthHelper } from './helpers/auth.helper';
import { login } from './helpers/auth-request.helper';

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
      });

      it('should return 400 when username is not provided', async () => {
        const response = await login('', 'admin123');

        expect(response.status).toBe(400);
        expect(response.body.succeeded).toBe(false);
      });

      it('should return 400 when password is not provided', async () => {
        const response = await login('admin', '');

        expect(response.status).toBe(400);
        expect(response.body.succeeded).toBe(false);
      });
    });
  });
});
