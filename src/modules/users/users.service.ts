import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DataSource, FindOptionsWhere, Not, Repository } from 'typeorm';
import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS } from './events/user-event.constants';
import { UserDeletedEvent } from './events/user-deleted.event';
import { UserCreatedEvent } from './events/user-created.event';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly eventEmitter: EventEmitter2,
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

  private async findActiveUserByUsername(
    username: string,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        NOME_USUARIO: username,
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
    });

    if (!user) {
      this.logger.warn(`User ${username} not found`);
      throw new NotFoundException(`Usuário "${username}" não encontrado.`);
    }

    return user;
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.findActiveUserByUsername(username);

    const isPasswordValid = await bcrypt.compare(password, user.SENHA);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
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

    this.eventEmitter.emit(
      USER_EVENTS.CREATED,
      new UserCreatedEvent(savedUser.ID, savedUser.NOME_USUARIO),
    );

    this.logger.log(`User ${savedUser.ID} (${savedUser.NOME_USUARIO}) created`);

    return plainToInstance(UserDto, savedUser, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: {
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
    });

    return plainToInstance(UserDto, users, { excludeExtraneousValues: true });
  }

  async findByUsername(username: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: {
        NOME_USUARIO: username,
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
    });

    if (!user) {
      this.logger.warn(`User ${username} not found`);
      throw new NotFoundException(`Usuário "${username}" não encontrado`);
    }

    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  async findById(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: {
        ID: id,
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
    });

    if (!user) {
      this.logger.warn(`User ${id} not found`);
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  async delete(id: number, username: string, req?: Request): Promise<void> {
    const user = await this.findActiveUser({ ID: id });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      user.STATUS = BaseEntityStatusEnum.EXCLUIDO;
      user.EXCLUIDO_POR = username;
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit(
        USER_EVENTS.DELETE,
        new UserDeletedEvent(id, user.NOME_USUARIO, req),
      );
      this.logger.log(
        `User ${id} (${user.NOME_USUARIO}) deleted by ${username}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findForAuth(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        ID: id,
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
    });

    if (!user) {
      this.logger.warn(`User ${id} not found for auth`);
      throw new UnauthorizedException('Acesso negado');
    }

    return user;
  }

  async updateRefreshToken(
    id: number,
    refreshToken: string | null,
  ): Promise<void> {
    const user = await this.findForAuth(id);
    user.REFRESH_TOKEN = refreshToken;
    await this.userRepository.save(user);
    this.logger.log(`Refresh token updated for user ${id}`);
  }
}
