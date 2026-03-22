import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtservice: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userService.validateCredentials(username, password);
    const tokens = await this.generateTokens(user.ID, user.NOME_USUARIO);
    await this.saveRefreshToken(user.ID, tokens.refresh_token);

    return {
      succeeded: true,
      data: tokens,
      message: 'Login realizado com sucesso',
    };
  }

  async refresh(userId: number, refresh_token: string) {
    const user = await this.userService.findForAuth(userId);

    if (!user.REFRESH_TOKEN) {
      throw new UnauthorizedException('Acesso negado');
    }

    const tokenMatch = await bcrypt.compare(refresh_token, user.REFRESH_TOKEN);

    if (!tokenMatch) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const tokens = await this.generateTokens(user.ID, user.NOME_USUARIO);
    await this.saveRefreshToken(user.ID, tokens.refresh_token);

    return {
      succeeded: true,
      data: tokens,
      message: 'Token atualizado com sucesso',
    };
  }

  async logout(userId: number) {
    await this.userService.updateRefreshToken(userId, null);

    return {
      succeeded: true,
      data: null,
      message: 'Logout realizado com sucesso',
    };
  }

  private async generateTokens(userId: number, username: string) {
    const payload = { username, sub: userId };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtservice.signAsync(payload, {
        expiresIn: '1d',
      }),
      this.jwtservice.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      }),
    ]);

    return { access_token, refresh_token };
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(userId, hashed);
  }
}
