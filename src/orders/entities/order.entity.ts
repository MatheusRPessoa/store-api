import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'USER_ID',
    type: 'text',
    length: 255,
  })
  USER_ID: number;

  @Column({
    name: 'TOTAL',
    type: 'decimal',
  })
  TOTAL: number;

  @OneToMany(() => OrderItemEntity, (item) => item.ORDER, {
    cascade: true,
  })
  ITEMS: OrderItemEntity[];

  @Column({
    name: 'CRIADO_POR',
    type: 'text',
    length: 20,
  })
  CRIADO_POR: string;

  @CreateDateColumn({
    type: 'datetime',
  })
  CRIADO_EM: Date;

  @Column({
    name: 'STATUS',
    type: 'text',
    length: 20,
    default: BaseEntityStatusEnum.ATIVO,
  })
  STATUS: BaseEntityStatusEnum;

  @Column({
    name: 'ATUALIZADO_POR',
    type: 'text',
    length: 20,
    nullable: true,
  })
  ATUALIZADO_POR: string | null;

  @Column({
    name: 'EXCLUIDO_POR',
    type: 'text',
    length: 20,
    nullable: true,
  })
  EXCLUIDO_POR: string | null;
}
