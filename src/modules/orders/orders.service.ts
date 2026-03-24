import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { UsersService } from 'src/modules/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/order-response.dto';
import { ORDER_EVENTS } from './events/order-event.constants';
import { OrderCreatedEvent } from './events/order-created.event';
import { plainToInstance } from 'class-transformer';
import { ProductEntity } from '../products/entities/product.entity';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { PaymentOrderResponseDto } from '../payment/dto/payment-response.dto';
import { PayOrderDto } from '../payment/dto/pay-order.dto';
import { PaymentStatusEnum } from '../payment/enums/payment-status.enum';
import { OrderStatusEnum } from './enums/order-status.enum';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { buildErrorLog } from 'src/common/utils/error-log.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectPinoLogger(OrdersService.name)
    private readonly logger: PinoLogger,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,

    private readonly userService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async findActiveOrderById(id: number): Promise<OrderEntity> {
    this.logger.debug({ orderId: id }, 'Buscando pedido ativo');

    const order = await this.orderRepository.findOne({
      where: {
        ID: id,
        STATUS: BaseEntityStatusEnum.ATIVO,
      },
      relations: ['ITEMS'],
    });

    if (!order) {
      this.logger.warn({ orderId: id }, 'Pedido não encontrado');
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }
    return order;
  }

  private async findOrderById(id: number): Promise<OrderEntity> {
    this.logger.debug({ orderId: id }, 'Buscando pedido');

    const order = await this.orderRepository.findOne({
      where: { ID: id },
      relations: ['ITEMS'],
    });

    if (!order) {
      this.logger.warn({ orderId: id }, 'Pedido não encontrado');
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    return order;
  }

  async create(dto: CreateOrderDto, username: string): Promise<OrderDto> {
    this.logger.info(
      { username, itemsCount: dto.ITEMS.length },
      'Iniciando criação de pedido',
    );

    const user = await this.userService.findByUsername(username);

    if (!dto.ITEMS || dto.ITEMS.length === 0) {
      this.logger.warn({ username }, 'Tentativa de criar pedido sem items');
      throw new BadRequestException('O pedido deve conter pelo menos um item');
    }

    let total = 0;

    try {
      const savedOrder = await this.dataSource.transaction(async (manager) => {
        const order = manager.create(OrderEntity, {
          USER_ID: user.ID,
          CRIADO_POR: user.NOME_USUARIO,
          ITEMS: [],
        });

        for (const item of dto.ITEMS) {
          const product = await manager.findOne(ProductEntity, {
            where: { ID: item.ID_PRODUTO },
            lock: { mode: 'pessimistic_write' },
          });

          if (!product) {
            this.logger.error(
              { productId: item.ID_PRODUTO, username },
              'Produto não encontrado ao criar pedido',
            );
            throw new NotFoundException('Produto não encontrado');
          }

          if (product.QUANTIDADE < item.QUANTIDADE) {
            this.logger.warn(
              {
                productId: item.ID_PRODUTO,
                requested: item.QUANTIDADE,
                available: product.QUANTIDADE,
              },
              'Estoque insuficiente',
            );
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

        return await manager.save(order);
      });

      this.eventEmitter.emit(
        ORDER_EVENTS.CREATED,
        new OrderCreatedEvent(savedOrder.ID, savedOrder.TOTAL),
      );

      this.logger.info(
        {
          orderId: savedOrder.ID,
          total: savedOrder.TOTAL,
          username: user.NOME_USUARIO,
          itemsCount: savedOrder.ITEMS.length,
        },
        'Pedido criado com sucesso',
      );

      return plainToInstance(OrderDto, savedOrder, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error(buildErrorLog(error), 'Erro ao criar pedido');
      throw error;
    }
  }

  async findAll(): Promise<OrderDto[]> {
    this.logger.debug('Listando todos os pedidos ativos');

    const orders = await this.orderRepository.find({
      where: {
        STATUS: BaseEntityStatusEnum.ATIVO,
      },
      relations: ['ITEMS'],
      order: { ID: 'DESC' },
    });

    if (!orders.length) {
      this.logger.info('Nenhum pedido encontrado');
      throw new NotFoundException('Nenhum pedido encontrado');
    }

    this.logger.info({ count: orders.length }, 'Pedidos listados com sucesso');

    return orders.map((order) =>
      plainToInstance(OrderDto, order, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: number): Promise<OrderDto> {
    this.logger.debug({ orderId: id }, 'Buscando pedido específico');

    const order = await this.findActiveOrderById(id);

    this.logger.info({ orderId: id }, 'Pedido encontrado');

    return plainToInstance(OrderDto, order, {
      excludeExtraneousValues: true,
    });
  }

  async cancel(id: number, username: string): Promise<void> {
    this.logger.warn(
      { orderId: id, username },
      'Iniciando cancelamento de pedido',
    );

    const user = await this.userService.findByUsername(username);
    const order = await this.findOrderById(id);

    if (order.STATUS === BaseEntityStatusEnum.EXCLUIDO) {
      throw new BadRequestException('Pedido já está cancelado');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        order.STATUS = BaseEntityStatusEnum.EXCLUIDO;
        order.EXCLUIDO_POR = user.NOME_USUARIO;

        await manager.save(order);

        for (const item of order.ITEMS) {
          const product = await manager.findOne(ProductEntity, {
            where: { ID: item.ID_PRODUTO },
            lock: { mode: 'pessimistic_write' },
          });

          if (!product) {
            this.logger.error(
              { productId: item.ID_PRODUTO, orderId: id },
              'Produto não encontrado ao cancelar o pedido',
            );
            throw new NotFoundException('Produto não encontrado');
          }

          product.QUANTIDADE += item.QUANTIDADE;

          await manager.save(product);
        }
      });

      this.logger.info(
        { orderId: id, username: user.NOME_USUARIO },
        'Pedido cancelado com sucesso',
      );
    } catch (error) {
      this.logger.error(buildErrorLog(error), 'Erro ao criar pedido');
      throw error;
    }
  }

  async pay(
    orderId: number,
    dto: PayOrderDto,
  ): Promise<PaymentOrderResponseDto> {
    this.logger.info(
      { orderId, paymentMethod: dto.method },
      'Iniciando pagamento do pedido',
    );

    const order = await this.orderRepository.findOne({
      where: { ID: orderId },
    });

    if (!order) {
      this.logger.warn({ orderId }, 'Pedido não encontrado para pagamento');
      throw new NotFoundException(`Pedido #${orderId} não encontrado`);
    }

    if (order.STATUS_PEDIDO === OrderStatusEnum.PAGO) {
      this.logger.warn({ orderId }, 'Tentativa de pagar pedido já pago');
      throw new BadRequestException(`Pedido #${orderId} já foi pago`);
    }

    try {
      const payment = this.paymentRepository.create({
        ID_PEDIDO: orderId,
        VALOR: order.TOTAL,
        METODO: dto.method,
        STATUS_PAGAMENTO: PaymentStatusEnum.APROVADO,
      });

      await this.paymentRepository.save(payment);

      order.STATUS_PEDIDO = OrderStatusEnum.PAGO;
      await this.orderRepository.save(order);

      this.logger.info(
        {
          orderId,
          paymentId: payment.ID,
          amount: payment.VALOR,
          method: payment.METODO,
        },
        'Pagamento processado com sucesso',
      );

      return {
        orderId: orderId,
        status: order.STATUS,
        payment: {
          status: payment.STATUS_PAGAMENTO,
          method: payment.METODO,
          amount: payment.VALOR,
        },
      };
    } catch (error) {
      this.logger.error(buildErrorLog(error), 'Erro ao criar pedido');
      throw error;
    }
  }
}
