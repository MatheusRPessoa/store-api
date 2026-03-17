import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

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
    example: 149.9,
  })
  PRECO: number;

  @Expose()
  @ApiProperty({
    description: 'Quantidade do produto em estoque.',
    example: 20,
  })
  QUANTIDADE: number;
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
