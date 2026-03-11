import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Endpoint responsável por criar um usuário',
  })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(
      dto.username,
      dto.password,
      dto.email,
    );
    return {
      succeeded: true,
      data: user,
      message: 'Usuário criado com sucesso',
    };
  }
}
