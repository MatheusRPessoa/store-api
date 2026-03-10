import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export const formatDate = (
  value: Date | string | number | null | undefined,
): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;
  return dateFormatter.format(date);
};

export class ProductDto {
    @Expose()
    @ApiProperty({
      description: 'Identificador único do registro',
      type: Number,
    })
    ID: number;

    @Expose()
    @ApiProperty({
      description: 'Usuário responsável pela criação',
      type: String,
    })
    CRIADO_POR: string;

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
      description: 'Nome do produto.',
      example: 'Café Santa Clara 250g',
    })
    NOME: string;

    @Expose()
    @ApiProperty({
      description: 'Descrição detalhada do produto.',
      example: 'Café torrado e moído de sabor intenso.', 
    })
    DESCRICAO: string;

    @Expose()
    @ApiProperty({
      description: 'Preço do produto.',
      example: 149.90
    })
    PRECO: number;

    @Expose()
    @ApiProperty({
      description: 'Quantidade do produto em estoque.',
      example: 20,
    })
    QUANTIDADE: number
}

export class ProductResponseDto {
  @ApiProperty({ description: 'Indica sucesso da operação', example: true })
  succeeded: boolean;

  @ApiProperty({ description: 'Dados do produto' })
  data: ProductDto;

  @ApiPropertyOptional({ description: 'Mensagem adicional' })
  message?: string;
}

export class ProductListResponseDto {
  @ApiProperty({
    description: 'Indica sucesso na operação',
    type: [ProductDto],
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Lista de produtos',
    type: [ProductDto],
  })
  data: ProductDto[];

  @ApiPropertyOptional({ description: 'Mensagem adicional' })
  message?: string;
}

export class SuccessResponseDto {
    @ApiProperty({
        description: 'indica sucesso da operação',
        example: true
    })
    succeeded: boolean;

    @ApiProperty({
        description: 'Mensagem informativa'
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