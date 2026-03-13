import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseUsernamePipe implements PipeTransform {
  transform(value: string) {
    if (!value || value.trim().length < 3) {
      throw new BadRequestException('Username deve ter no mínimo 3 caracteres');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new BadRequestException('Username contém caracteres inválidos');
    }
    return value;
  }
}
