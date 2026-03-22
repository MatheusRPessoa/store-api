import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nome do usuário para login',
    example: 'joao.silva',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'O valor informado deve ser do tipo texto' })
  @IsNotEmpty({ message: 'O username é obrigatório' })
  @MinLength(3, { message: 'O username deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'O username deve ter no máximo 52 caracteres' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'admin123',
  })
  @IsString({ message: 'O valor informado deve ser do tipo texto' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;
}
