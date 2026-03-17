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
import { UsersService } from 'src/modules/users/users.service';
import { ProductsService } from 'src/modules/products/products.service';
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

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const order = manager.create(OrderEntity, {
        USER_ID: user.ID,
        CRIADO_POR: user.NOME_USUARIO,
        ITEMS: [],
      });

      for (const item of dto.ITEMS) {
        const product = await this.productService.findOne(item.ID_PRODUTO);

        if (!product) {
          throw new NotFoundException();
        }

        if (product.QUANTIDADE < item.QUANTIDADE) {
          throw new BadRequestException('Estoque insuficiente');
        }

        const subtotal = product.PRECO * item.QUANTIDADE;
        total += subtotal;

        product.QUANTIDADE -= item.QUANTIDADE;
        await manager.save(product);

        const orderItem = manager.create(OrderItemEntity, {
          ID_PRODUTO: product.ID,
          QUANTIDADE: item.QUANTIDADE,
          PRECO: product.PRECO,
        });

        order.ITEMS.push(orderItem);
      }

      order.TOTAL = total;

      const saved = await manager.save(order);

      this.eventEmitter.emit(
        ORDER_EVENTS.CREATED,
        new OrderCreatedEvent(saved.ID, saved.TOTAL),
      );

      this.logger.log(
        `Order ${saved.ID} created by ${user.NOME_USUARIO} - TOTAL ${saved.TOTAL}`,
      );

      return saved;
    });

    return plainToInstance(OrderDto, savedOrder, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      where: {
        STATUS: BaseEntityStatusEnum.ATIVO,
      },
      relations: ['ITEMS'],
      order: { ID: 'DESC' },
    });

    if (!orders.length) {
      throw new NotFoundException('Nenhum pedido encontrado');
    }

    return orders.map((order) =>
      plainToInstance(OrderDto, order, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: number): Promise<OrderDto> {
    const order = await this.findActiveOrderById(id);

    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  async cancel(id: number, username: string): Promise<void> {
    const user = await this.userService.findByUsername(username);

    const order = await this.findActiveOrderById(id);

    if (order.STATUS === BaseEntityStatusEnum.EXCLUIDO) {
      throw new BadRequestException('Pedido já está cancelado');
    }

    await this.dataSource.transaction(async (manager) => {
      order.STATUS = BaseEntityStatusEnum.EXCLUIDO;
      order.EXCLUIDO_POR = user.NOME_USUARIO;

      await manager.save(order);

      for (const item of order.ITEMS) {
        const product = await this.productService.findOne(item.ID_PRODUTO);

        product.QUANTIDADE += item.QUANTIDADE;

        await manager.save(product);
      }
    });

    this.logger.log(`Order ${id} canceled by ${user.NOME_USUARIO}`);
  }
}
