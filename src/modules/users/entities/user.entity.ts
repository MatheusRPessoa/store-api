import { BaseEntityStatusEnum } from '../../../config/database/entities/enums/base-entity-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('USUARIOS')
export class UserEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'NOME_USUARIO',
    type: 'varchar',
    length: 255,
  })
  NOME_USUARIO: string;

  @Column({
    name: 'EMAIL',
    type: 'varchar',
    length: 255,
  })
  EMAIL: string;

  @Column({
    name: 'SENHA',
    type: 'varchar',
    length: 255,
  })
  SENHA: string;

  @Column({
    name: 'REFRESH_TOKEN',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  REFRESH_TOKEN: string | null;

  @Column({
    name: 'STATUS',
    type: 'varchar',
    length: 20,
    default: BaseEntityStatusEnum.ATIVO,
  })
  STATUS: BaseEntityStatusEnum;

  @Column({
    name: 'ATUALIZADO_POR',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ATUALIZADO_POR: string | null;

  @Column({
    name: 'EXCLUIDO_POR',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  EXCLUIDO_POR: string | null;

  @CreateDateColumn({
    type: 'timestamp',
  })
  CRIADO_EM: Date;
}
