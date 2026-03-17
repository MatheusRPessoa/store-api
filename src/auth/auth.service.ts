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

    const passwordMatch = await bcrypt.compare(password, user.SENHA);

    if (!passwordMatch) {
      throw new UnauthorizedException('Creadenciais inválidas');
    }

    const payload = {
      username: user.NOME_USUARIO,
      sub: user.ID,
    };

    return {
      access_token: this.jwtservice.sign(payload),
    };
  }
}
