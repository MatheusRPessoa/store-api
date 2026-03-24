import { BaseEntityStatusEnum } from '../../../config/database/entities/enums/base-entity-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('PRODUTOS')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'NOME',
    type: 'varchar',
    length: 255,
  })
  NOME: string;

  @Column({
    name: 'DESCRICAO',
    type: 'varchar',
    length: 255,
  })
  DESCRICAO: string;

  @Column({
    name: 'PRECO',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  PRECO: number;

  @Column({
    name: 'QUANTIDADE',
    type: 'int',
  })
  QUANTIDADE: number;

  @Column({
    name: 'CRIADO_POR',
    type: 'varchar',
    length: 20,
  })
  CRIADO_POR: string;

  @CreateDateColumn({
    type: 'timestamp',
  })
  CRIADO_EM: Date;

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
}
