import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  OrderListResponseDto,
  OrderResponseDto,
} from './dto/order-response.dto';
import type { AuthUser } from '../../auth/types/auth-user.type';
import {
  BadRequestResponseDto,
  UnauthorizedResponseDto,
} from 'src/common/dto/pagination/error-response.dto';
import { BaseSuccessResponseDto } from 'src/common/dto/pagination/base-response.dto';
import { PayOrderDto } from '../payment/dto/pay-order.dto';
import { PaymentOrderResponseDto } from '../payment/dto/payment-response.dto';

@ApiTags('Pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class OrdersController {
  constructor(private readonly orderService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Criar um pedido',
    description: 'Endpoint responsável por criar um pedido',
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido criado com sucesso',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ao pedido',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de sessão não encontrado ou sessão inválida/expirada',
    type: UnauthorizedResponseDto,
  })
  async create(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.create(dto, user.username);

    return {
      succeeded: true,
      data: order,
      message: 'Pedido criado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Listar pedidos',
    description: 'Retorna todos os pedidos ativos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retorna com sucesso',
    type: OrderListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
    type: UnauthorizedResponseDto,
  })
  async findAll(): Promise<OrderListResponseDto> {
    const orders = await this.orderService.findAll();

    return {
      succeeded: true,
      data: orders,
      message: 'Pedidos listados com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar pedido pelo ID',
    description: 'Retorna um pedido específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
    type: UnauthorizedResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const order = await this.orderService.findOne(Number(id));

    return {
      succeeded: true,
      data: order,
      message: 'Pedido encontrado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar pedido',
    description: 'Realiza o cancelamento de um pedido',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado com sucesso',
    type: BaseSuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao cancelar pedido',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido ou expirado',
    type: UnauthorizedResponseDto,
  })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<BaseSuccessResponseDto> {
    await this.orderService.cancel(Number(id), user.username);

    return {
      succeeded: true,
      message: 'Pedido cancelado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realizar pagamento',
    description: 'Processa o pagamento com sucesso',
  })
  @ApiResponse({
    status: 201,
    description: 'Pagamento processado com sucesso',
    example: {
      card: {
        summary: 'Pagamento com cartão',
        value: {
          method: 'CARD',
          amount: 199.9,
        },
      },
    },
    type: PaymentOrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido inválido ou já pago',
    type: PaymentOrderResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
    type: UnauthorizedResponseDto,
  })
  async pay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PayOrderDto,
  ): Promise<BaseSuccessResponseDto<PaymentOrderResponseDto>> {
    const data = await this.orderService.pay(id, dto);

    return {
      succeeded: true,
      data,
    };
  }
}
