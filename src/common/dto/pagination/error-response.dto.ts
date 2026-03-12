import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailsDto {
  @ApiProperty({
    description: 'Mensagem de erro',
    example: 'Validation failed (numeric string is expected)',
  })
  message: string;

  @ApiProperty({
    description: 'Tipo do erro',
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

export class UnauthorizedResponseDto {
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
    example: 'Token de sessão não encontrado.',
  })
  message: string;

  @ApiProperty({
    description: 'Detalhes do erro',
    example: {
      message: 'Token de sessão não encontrado.',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  error: ErrorDetailsDto;
}

export class ForbiddenResponseDto {
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
    example: 'Você não tem permissão para realizar esta ação.',
  })
  message: string;

  @ApiProperty({
    description: 'Detalhes do erro',
    example: {
      message: 'Você não tem permissão para realizar esta ação.',
      error: 'Forbidden',
      statusCode: 403,
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

export class ConflictDeletedUserDataDto {
  @ApiProperty({
    description: 'ID do usuário excluído encontrado',
    example: 42,
  })
  ID_USUARIO: number;
}

export class ConflictDeletedUserResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem sucedida',
    example: false,
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Dados do usuário excluído encontrado',
    type: ConflictDeletedUserDataDto,
  })
  data: ConflictDeletedUserDataDto;

  @ApiProperty({
    description: 'Mensagem de erro',
    example:
      'Já existe um usuário excluído com este email. Utilize o endpoint de reativação.',
  })
  message: string;

  @ApiProperty({
    description: 'Detalhes do erro',
    example: {
      message:
        'Já existe um usuário excluído com este email. Utilize o endpoint de reativação.',
      error: 'Conflict',
      statusCode: 409,
    },
  })
  error: ErrorDetailsDto;
}

export class TooManyRequestsDataDto {
  @ApiProperty({
    description: 'Tempo em segundos até poder tentar novamente',
    example: 45,
  })
  retryAfter: number;
}

export class TooManyRequestsResponseDto {
  @ApiProperty({
    description: 'Indica se a operação foi bem sucedida',
    example: false,
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Dados com informações para retry',
    type: TooManyRequestsDataDto,
  })
  data: TooManyRequestsDataDto;

  @ApiProperty({
    description: 'Mensagem de erro',
    example:
      'Muitas tentativas realizadas. Por favor, aguarde 45 segundos antes de tentar novamente.',
  })
  message: string;

  @ApiProperty({
    description: 'Detalhes do erro',
    example: {
      message: 'Too Many Requests',
      statusCode: 429,
    },
  })
  error: ErrorDetailsDto;
}
