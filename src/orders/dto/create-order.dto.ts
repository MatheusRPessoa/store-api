import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: '1234567',
  })
  @IsNumber({}, { message: 'O ID do produto deve ser do tipo número' })
  @IsNotEmpty({ message: 'O ID do produto é obrigatório' })
  ID_PRODUTO: number;

  @ApiProperty({
    description: 'QUANTIDADE do produto no pedido',
    example: 2,
  })
  @IsNumber(
    {},
    { message: 'A QUANTIDADE do produto no pedido deve ser do tipo número' },
  )
  @Min(1, { message: 'A quantidade mínima é 1' })
  QUANTIDADE: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Lista de items do pedido',
    type: [CreateOrderItemDto],
  })
  @IsArray({ message: 'Os itens devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  ITEMS: CreateOrderItemDto[];
}
