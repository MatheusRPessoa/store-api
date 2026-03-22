import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { AuthenticatedRequest } from 'src/common/interface/authenticated-request.inteface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { BaseSuccessResponseDto } from 'src/common/dto/pagination/base-response.dto';
import { UnauthorizedResponseDto } from 'src/common/dto/pagination/error-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Realizar login',
    description: 'Autentica o usuário e retorna tokens JWT',
  })
  @ApiResponse({
    status: 201,
    description: 'Login efetuado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    type: LoginResponseDto,
  })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar tokens',
    description: 'Gera novos tokens usando o refresh token',
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens renovados com sucesso',
    type: LoginResponseDto,
  })
  async refresh(@Req() req: AuthenticatedRequest) {
    return this.authService.refresh(req.user.sub, req.user.refreshToken!);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Realizar logout',
    description: 'Invalida o refresh token do usuário e encerra a sessão',
  })
  @ApiResponse({
    status: 201,
    description: 'Logout realizado com sucesso',
    type: BaseSuccessResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
    type: UnauthorizedResponseDto,
  })
  async logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.sub);
  }
}
