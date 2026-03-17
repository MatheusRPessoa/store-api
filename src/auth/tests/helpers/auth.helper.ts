import fetch from 'node-fetch';
import { UserEntity } from '../../../modules/users/entities/user.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

interface AuthResponse {
  access_token: string;
}

export class AuthHelper {
  private static accessToken: string;

  static async setup(dataSource: DataSource) {
    const repo = dataSource.getRepository(UserEntity);

    const exists = await repo.findOne({ where: { NOME_USUARIO: 'admin' } });

    if (!exists) {
      const user = repo.create({
        NOME_USUARIO: 'admin',
        SENHA: await bcrypt.hash('admin123', 10),
        EMAIL: 'admin@admin.com.br',
      });
      await repo.save(user);
    }

    await this.authenticate();
  }

  static async authenticate() {
    const response = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
      }),
    });

    if (!response.ok) {
      throw new Error(`Falha ao autenticar: ${response.status}`);
    }

    const data = (await response.json()) as AuthResponse;
    this.accessToken = data.access_token;

    if (!this.accessToken) {
      throw new Error('Falha ao autenticar. Nenhum token retornado');
    }
  }

  static getAuthHeader() {
    if (!this.accessToken) {
      throw new Error('Usuário não autenticado');
    }

    return { Authorization: `Bearer ${this.accessToken}` };
  }
}
