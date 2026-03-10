import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { BadRequestResponseDto, ProductListResponseDto, ProductResponseDto } from './dto/products-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Mercadorias')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

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
        type: BadRequestResponseDto
    })
    async create(@Body() dto: CreateProductDto
    ): Promise<ProductResponseDto> {
        const product = await this.productsService.create(
            dto,
        );
        return {
            succeeded: true,
            data: product,
            message: 'Produto criado com sucesso',
        };
    }
    
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
            message: 'Produtos encontrados com sucesso'
        };
    }

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
        @Req() req: Request,
    ): Promise<ProductResponseDto> {
       const product = await this.productsService.update(
         id,
         dto,
         req,
       );
       return {
        succeeded: true,
        data: product,
        message: 'Produto atualizado com sucesso',
       }
    }
}
