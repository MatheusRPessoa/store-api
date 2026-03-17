// src/config/database/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ProductEntity } from '../../modules/products/entities/product.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { OrderEntity } from '../../modules/orders/entities/order.entity';
import { OrderItemEntity } from '../../modules/orders/entities/order-item.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [UserEntity, ProductEntity, OrderEntity, OrderItemEntity],
  migrations: [],
  subscribers: [],
});
