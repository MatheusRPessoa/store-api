import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order-response.dto';
import { ORDER_EVENTS } from './events/order-event.constants';
import { OrderCreatedEvent } from './events/order-created.event';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,

    private readonly userService: UsersService,
    private readonly productService: ProductsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async findActiveOrderById(id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: {
        ID: id,
        STATUS: BaseEntityStatusEnum.ATIVO,
      },
      relations: ['ITEMS'],
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    return order;
  }

  async create(dto: CreateOrderDto, username: string): Promise<OrderDto> {
    const user = await this.userService.findByUsername(username);

    if (!dto.ITEMS || dto.ITEMS.length === 0) {
      throw new BadRequestException('O pedido deve conter pelo menos um item');
    }

    let total = 0;

    const order = new OrderEntity();
    const orderItems: OrderItemEntity[] = [];

    await this.dataSource.transaction(async (manager) => {
      for (const item of dto.ITEMS) {
        const product = await this.productService.findOne(item.ID_PRODUTO);

        if (!product) {
          throw new NotFoundException(
            `Produto com ID ${item.ID_PRODUTO} não encontrado`,
          );
        }

        if (product.QUANTIDADE < item.QUANTIDADE) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${product.NOME}`,
          );
        }

        const subtotal = product.PRECO * item.QUANTIDADE;
        total += subtotal;

        product.QUANTIDADE -= item.QUANTIDADE;

        await manager.save(product);

        const orderItem = this.orderItemRepository.create({
          ID_PRODUTO: product.ID,
          QUANTIDADE: product.QUANTIDADE,
          PRECO: product.PRECO,
        });

        orderItems.push(orderItem);
      }

      order.ITEMS = orderItems;
      order.TOTAL = total;
      order.CRIADO_POR = user.NOME_USUARIO;

      const savedOrder = await manager.save(order);

      for (const item of orderItems) {
        item.ORDER = savedOrder;
        await manager.save(item);
      }

      this.eventEmitter.emit(
        ORDER_EVENTS.CREATED,
        new OrderCreatedEvent(savedOrder.ID, savedOrder.TOTAL),
      );

      this.logger.log(
        `Order ${savedOrder.ID} created by ${user.NOME_USUARIO} - total ${savedOrder.TOTAL}`,
      );
    });

    const savedOrder = await this.findActiveOrderById(order.ID);

    return plainToInstance(OrderDto, savedOrder, {
      excludeExtraneousValues: true,
    });
  }
}
