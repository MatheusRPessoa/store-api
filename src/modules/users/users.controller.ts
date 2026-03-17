import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserListResponseDto, UserResponseDto } from './dto/user-response.dto';
import {
  BadRequestResponseDto,
  NotFoundResponseDto,
  UnauthorizedResponseDto,
} from '../../common/dto/pagination/error-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ParseUsernamePipe } from 'src/common/pipes/parse-username.pipe';

@ApiTags('Usuarios')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Endpoint responsável por criar um usuário',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ao Usuário',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de sessão não encontrado ou sessão inválida/expirada',
    type: UnauthorizedResponseDto,
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

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Endpoint responsável por listar todos os usuários',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuários encontrados',
    type: UserListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de sessão não encontrado ou sessão inválida/expirada',
    type: UnauthorizedResponseDto,
  })
  async findAll(): Promise<UserListResponseDto> {
    const users = await this.userService.findAll();

    return {
      succeeded: true,
      data: users,
      message: 'Usuários listados com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description:
      'Endpoint responsável por retornar os dados de um usuário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    type: 'number',
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'O parâmetro informado não é válido',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
    type: NotFoundResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de sessão não encontrado ou sessão inválida/expirada',
    type: UnauthorizedResponseDto,
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    return {
      succeeded: true,
      data: user,
      message: 'Usuário encontrado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('username/:username')
  @ApiOperation({
    summary: 'Buscar usuário por username',
    description:
      'Endpoint responsável por retornar os dados de um usuário pelo nome',
  })
  @ApiParam({
    name: 'username',
    description: 'Nome do usuário',
    type: 'string',
    required: true,
    example: 'HG_MATHEUS',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de sessão não encontrado ou sessão inválida/expirada',
    type: UnauthorizedResponseDto,
  })
  async findByUsername(
    @Param('username', ParseUsernamePipe) username: string,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findByUsername(username);
    return {
      succeeded: true,
      data: user,
      message: 'Usuário encontrado com sucesso',
    };
  }
}
