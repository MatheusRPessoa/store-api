import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'ID_PRODUTO',
    type: 'integer',
  })
  ID_PRODUTO: number;

  @Column({
    name: 'QUANTIDADE',
    type: 'integer',
  })
  QUANTIDADE: number;

  @Column({
    name: 'PRECO',
    type: 'float',
  })
  PRECO: number;

  @ManyToOne(() => OrderEntity, (order) => order.ITEMS)
  ORDER: OrderEntity;
}
