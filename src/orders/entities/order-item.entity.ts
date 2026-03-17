import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'ID_PRODUTO',
    type: Number,
  })
  ID_PRODUTO: number;

  @Column({
    name: 'QUANTIDADE',
    type: Number,
  })
  QUANTIDADE: number;

  @Column({
    name: 'PRECO',
    type: Number,
  })
  PRECO: number;

  @ManyToOne(() => OrderEntity, (order) => order.ITEMS)
  ORDER: OrderEntity;
}
