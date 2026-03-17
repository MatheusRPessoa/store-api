import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome do usuário para login',
    example: 'admin',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'O valor informado deve ser do tipo texto.' })
  @IsNotEmpty({ message: 'O username é obrigatório' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'admin123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString({ message: 'O valor informado deve ser do tipo texto' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'admin@mail.com',
  })
  @IsEmail({}, { message: 'O email informado é inválido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;
}
