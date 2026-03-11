import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import { formatDate } from 'src/products/dto/products-response.dto';

export class UserDto {
  @Expose()
  @ApiProperty({
    description: 'Identificador único do usuário',
    type: Number,
  })
  ID: number;

  @Expose()
  @ApiProperty({
    description: 'Nome do usuário para login',
    example: 'admin',
  })
  NOME_USUARIO: string;

  @Expose()
  @ApiProperty({
    description: 'Status do usuário',
    example: BaseEntityStatusEnum.ATIVO,
    enum: BaseEntityStatusEnum,
  })
  STATUS: BaseEntityStatusEnum;

  @ApiProperty({
    description: 'Data de criação do registro',
    type: String,
    example: '17/12/2025, 10:30:45',
  })
  @Transform(({ value }: { value: Date | string | null }) => formatDate(value))
  @Expose()
  CRIADO_EM: Date | string;

  @Expose()
  @ApiProperty({
    description: 'Usuário responsável pela criação',
    example: 'system',
    type: String,
  })
  CRIADO_POR: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'Indica sucesso da operação', example: true })
  succeeded: boolean;

  @ApiProperty({ description: 'Dados do usuário' })
  data: UserDto;

  @ApiPropertyOptional({ description: 'Mensagem adicional' })
  message?: string;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'Indica sucesso da operação',
    type: [UserDto],
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Lista de usuários',
    type: [UserDto],
  })
  data: UserDto[];

  @ApiPropertyOptional({ description: 'Mensagem opcional' })
  message?: string;
}

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Indica sucesso da operação',
    example: true,
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Mensagem informativa',
  })
  message: string;
}

export class ErrorDetailsDto {
  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Validation failed (numeric string is expected)',
  })
  message: string;

  @ApiProperty({
    description: 'Tipo de erro',
    example: 'Bad Request',
  })
  error: string;

  @ApiProperty({
    description: 'Código de status HTTP',
    example: 400,
  })
  statusCode: number;
}

export class BadRequestResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem sucedida',
    example: false,
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Dados retornados (sempre null em caso de erro)',
    example: null,
    nullable: true,
    required: false,
  })
  data: unknown;

  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Validation failed (numeric string is expected)',
  })
  message: string;

  @ApiProperty({
    description: 'Detalhes do erro',
    example: {
      message: 'Validation failed (numeric string is expected)',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  error: ErrorDetailsDto;
}

export class NotFoundResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem sucedida',
    example: false,
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Dados retornados (sempre null em caso de erro)',
    example: null,
    nullable: true,
    required: false,
  })
  data: unknown;

  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Recurso não encontrado.',
  })
  message: string;

  @ApiProperty({
    description: 'Detalhes do erro',
    example: {
      message: 'Recurso não encontrado.',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  error: ErrorDetailsDto;
}
