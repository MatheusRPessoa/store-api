import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  private async findActiveUser(
    where: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        ...where,
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuário não encontrado.`);
    }

    return user;
  }

  async findByUsername(username: string) {
    return this.findActiveUser({ NOME_USUARIO: username });
  }

  async findById(id: number) {
    return this.findActiveUser({ ID: id });
  }

  async create(
    username: string,
    password: string,
    email: string,
  ): Promise<UserDto> {
    const existing = await this.userRepository.findOne({
      where: { NOME_USUARIO: username },
    });
    if (existing) {
      throw new BadRequestException('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      NOME_USUARIO: username,
      SENHA: hashedPassword,
      EMAIL: email,
      STATUS: BaseEntityStatusEnum.ATIVO,
    });

    const savedUser = await this.userRepository.save(user);

    return plainToInstance(UserDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }
}
