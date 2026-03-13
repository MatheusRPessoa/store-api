import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchProductByNameDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Produto A',
    minLength: 3,
  })
  @IsString({ message: 'O nome do produto deve ser texto.' })
  @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
  name: string;
}
