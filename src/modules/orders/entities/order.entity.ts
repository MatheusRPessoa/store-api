import { BaseEntityStatusEnum } from '../../../config/database/entities/enums/base-entity-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

@Entity('PEDIDOS')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'USER_ID',
    type: 'integer',
  })
  USER_ID: number;

  @Column({
    name: 'TOTAL',
    type: 'float',
  })
  TOTAL: number;

  @OneToMany(() => OrderItemEntity, (item) => item.ORDER, {
    cascade: true,
  })
  ITEMS: OrderItemEntity[];

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
    enum: BaseEntityStatusEnum,
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
