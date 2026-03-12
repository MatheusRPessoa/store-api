// src/config/database/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity';
import { UserEntity } from '../../users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: [UserEntity, ProductEntity],
  migrations: [],
  subscribers: [],
});
