import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateOrderItemDto {
  @ApiProperty({
    description: 'ID do produto',
    example: 1234,
    type: Number,
  })
  @IsNumber({}, { message: 'O ID do produto deve ser do tipo número' })
  @IsPositive({ message: 'O ID do produto deve ser um número positivo' })
  @IsNotEmpty({ message: 'O ID do produto é obrigatório' })
  ID_PRODUTO: number;

  @ApiProperty({
    description: 'QUANTIDADE do produto no pedido',
    example: 2,
    minimum: 1,
    type: Number,
  })
  @IsNumber(
    {},
    { message: 'A QUANTIDADE do produto no pedido deve ser do tipo número' },
  )
  @IsPositive({ message: 'A quantidade deve ser um número positivo' })
  @Min(1, { message: 'A quantidade mínima é 1' })
  QUANTIDADE: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Lista de items do pedido',
    type: [CreateOrderItemDto],
    example: [
      {
        ID_PRODUTO: 1,
        QUANTIDADE: 1,
      },
      {
        ID_PRODUTO: 2,
        QUANTIDADE: 1,
      },
      {
        ID_PRODUTO: 3,
        QUANTIDADE: 1,
      },
    ],
  })
  @IsArray({ message: 'Os itens devem ser um array' })
  @ArrayMinSize(1, { message: 'O pedido deve conter pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  ITEMS: CreateOrderItemDto[];
}
