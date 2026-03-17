import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductListResponseDto,
  ProductResponseDto,
} from './dto/products-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../../auth/types/auth-user.type';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  BadRequestResponseDto,
  NotFoundResponseDto,
  UnauthorizedResponseDto,
} from '../../common/dto/pagination/error-response.dto';
import { SearchProductByNameDto } from './dto/search-product-by-name.dto';
import { BaseSuccessResponseDto } from '../../common/dto/pagination/base-response.dto';

@ApiTags('Mercadorias')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Criar um produto',
    description: 'Enpoint responsável por criar um produto',
  })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ao Produto',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de sessão não encontrado ou sessão inválida/expirada',
    type: UnauthorizedResponseDto,
  })
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.create(dto, user.username);
    return {
      succeeded: true,
      data: product,
      message: 'Produto criado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Listar todos os produtos.',
    description: 'EndPoint responsável por listar todos os produtos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de Produtos retornado com sucesso.',
  })
  async findAll(): Promise<ProductListResponseDto> {
    const products = await this.productsService.findAll();
    return {
      succeeded: true,
      data: products,
      message: 'Produtos encontrados com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description:
      'Endpoint responsável por retornar os dados de um produto específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    type: 'number',
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'O parâmetro informado não é válido',
    type: BadRequestResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(id);
    return {
      succeeded: true,
      data: product,
      message: 'Produto encontrado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('search/by-name')
  @ApiOperation({
    summary: 'Buscar produto por nome',
    description: 'Endpoint responsável por retornar produtos pelo nome',
  })
  @ApiQuery({
    name: 'name',
    description: 'Nome do produto',
    type: 'string',
    required: true,
    example: 'Produto A',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos encontrados com sucesso',
    type: ProductListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'O parâmetro informado não é válido',
    type: BadRequestResponseDto,
  })
  async findByName(
    @Query() query: SearchProductByNameDto,
  ): Promise<ProductListResponseDto> {
    const products = await this.productsService.findByName(query.name);
    return {
      succeeded: true,
      data: products,
      message: 'Produtos encontrados com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar produto',
    description: 'Endpoint responsável por atualizar produto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    type: 'number',
    required: true,
    example: 1,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.update(id, dto, user.username);
    return {
      succeeded: true,
      data: product,
      message: 'Produto atualizado com sucesso',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir produto.',
    description: 'Endpoint responsável por excluir um produto',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    type: 'number',
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Produto excluido com sucesso',
    type: BaseSuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'O parâmetro informado não é válido',
    type: BadRequestResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
    type: NotFoundResponseDto,
  })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ): Promise<BaseSuccessResponseDto> {
    await this.productsService.delete(id, user.username);
    return {
      succeeded: true,
      message: 'Produto excluido com sucesso',
    };
  }
}
