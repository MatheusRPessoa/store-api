import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

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

export class OrderItemDto {
  @Expose()
  @ApiProperty({
    description: 'Identificadosr do item do pedido',
    example: 1,
    type: Number,
  })
  ID: number;

  @Expose()
  @ApiProperty({
    description: 'ID do produto',
    example: 1,
    type: Number,
  })
  ID_PRODUTO: number;

  @Expose()
  @ApiProperty({
    description: 'Quantidade do produto no pedido',
    example: 2,
    type: Number,
  })
  QUANTIDADE: number;

  @Expose()
  @ApiProperty({
    description: 'Preço do produto no momento da compra',
    example: 149.9,
    type: Number,
  })
  PRECO: number;
}

export class OrderDto {
  @Expose()
  @ApiProperty({
    description: 'Identificador único do pedido',
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
    description: 'Valor total do pedido',
    example: 299.8,
  })
  TOTAL: number;

  @Expose()
  @ApiProperty({
    description: 'Itens do pedido',
    type: [OrderItemDto],
  })
  @Type(() => OrderItemDto)
  ITEMS: OrderItemDto[];
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Indica sucesso da operação',
    example: true,
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Dados do pedido',
    type: OrderDto,
  })
  data: OrderDto;

  @ApiProperty({
    description: 'Mensagem adicional',
  })
  message?: string;
}

export class OrderListResponseDto {
  @ApiProperty({
    description: 'Indica sucesso da operação',
    example: true,
  })
  succeeded: boolean;

  @ApiProperty({
    description: 'Lista de pedidos',
    type: [OrderDto],
  })
  data: OrderDto[];

  @ApiPropertyOptional({
    description: 'Mensagem adicional',
  })
  message?: string;
}
