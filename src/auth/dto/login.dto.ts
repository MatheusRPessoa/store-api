import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nome do usuário para login',
    example: 'admin',
  })
  @IsString({ message: 'O valor informado deve ser do tipo texto' })
  @IsNotEmpty({ message: 'O username é obrigatório' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'admin123',
  })
  @IsString({ message: 'O valor informado deve ser do tipo texto' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
