// dto/base-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty()
  succeeded: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty()
  message: string;
}

/**
 * Classe base para respostas de sucesso.
 * Estenda esta classe e adicione a propriedade `data` com o tipo específico.
 *
 * @example
 * export class UserResponseDto extends BaseSuccessResponseDto {
 *   @ApiProperty({ type: UserDto })
 *   data: UserDto;
 * }
 */
export abstract class BaseSuccessResponseDto<T = unknown> {
  @ApiProperty({ description: 'Indica sucesso da operação', example: true })
  succeeded: boolean;

  @ApiPropertyOptional({ description: 'Mensagem adicional' })
  message?: string;

  @ApiProperty({ description: 'Body de resposta' })
  data?: T;
}

/**
 * Classe base para respostas de sucesso sem dados (apenas mensagem).
 * Use para operações como DELETE que não retornam dados.
 */
export class SuccessMessageResponseDto {
  @ApiProperty({ description: 'Indica sucesso da operação', example: true })
  succeeded: boolean;

  @ApiProperty({ description: 'Mensagem informativa' })
  message: string;
}
