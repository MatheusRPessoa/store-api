import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('USUARIOS')
export class UserEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'NOME_USUARIO',
    type: 'text',
    length: 255,
  })
  NOME_USUARIO: string;

  @Column({
    name: 'EMAIL',
    type: 'text',
    length: 255,
  })
  EMAIL: string;

  @Column({
    name: 'SENHA',
    type: 'text',
    length: 255,
  })
  SENHA: string;

  @Column({
    name: 'STATUS',
    type: 'text',
    length: 20,
    default: BaseEntityStatusEnum.ATIVO,
  })
  STATUS: BaseEntityStatusEnum;
}
