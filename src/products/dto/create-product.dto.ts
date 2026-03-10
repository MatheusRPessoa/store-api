import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateProductDto {
    @ApiProperty({
      description: 'Nome do produto.',
      example: 'Café Santa Clara 250g',
      minLength: 1,
      maxLength: 255,
    })
    @IsString({ message: 'O nome do produto deve ser do tipo texto.' })
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    NOME: string
    
    @ApiProperty({
      description: 'Descrição detalhada do produto.',
      example: 'Café torrado e moído de sabor intenso.',
      minLength: 1,
      maxLength: 255, 
    })
    @IsString({ message: 'A descrição deve ser do tipo texto.' })
    @IsNotEmpty({ message: 'A descrição é obrigatória.' })
    DESCRICAO: string

    @ApiProperty({
      description: 'Preço do produto.',
      example: 149.90
    })
    @IsNumber({}, { message: 'O preço tem que ser do tipo número.'})
    @Min(0)
    PRECO: number

    @ApiProperty({
      description: 'Quantidade do produto em estoque.',
      example: 20,
    })
    @IsNumber()
    @Min(0)
    QUANTIDADE: number
}