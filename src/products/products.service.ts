import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ProductEntity } from './entities/product.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from './dto/products-response.dto';
import { BaseEntityStatusEnum } from 'src/config/database/entities/enums/base-entity-status.enum';
import { UpdateProductDto } from './dto/update-product.dto';



@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name)
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>
    ) {}

    private normalizeProductName(name: string): string {
      const unitsUpper = ['l', 'ml'];   // unidades que ficam em maiúsculo
      const unitsLower = ['g', 'kg'];   // unidades que ficam em minúsculo

      return name
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => {

      const unitMatch = word.match(/^(\d+)([a-z]+)$/);

      if (unitMatch) {
        const number = unitMatch[1];
        const unit = unitMatch[2];

        if (unitsUpper.includes(unit)) {
          return number + unit.toUpperCase();
        }

        if (unitsLower.includes(unit)) {
          return number + unit.toLowerCase();
        }
      }

      return word
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('-');
    })
    .join(' ');
    }

    private async findActiveProductId(id: number): Promise<ProductEntity> {
        const product = await this.productRepository.findOne({
        where: {
            ID: id,
            STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
        },
        });

        if (!product) {
        throw new NotFoundException(`Grupo com ID ${id} não encontrado.`);
        }

        return product;
    }

    private async findByName(
    name: string,
    excludeId?: number,
    ): Promise<ProductEntity | null> {
        return this.productRepository.findOne({
        where: {
            NOME: name,
            STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
            ...(excludeId && { ID: Not(excludeId) }),
        },
        });
    }

    async create(
        dto: CreateProductDto,
    ): Promise<ProductDto> {
        const product = this.productRepository.create({
            ...dto,
            CRIADO_POR: 'system',
        });

        const savedProduct =  await this.productRepository.save(product);

        return plainToInstance(ProductDto, savedProduct, {
            excludeExtraneousValues: true,
        });
    }

    async findAll(): Promise<ProductDto[]> {
        const products = await this.productRepository.find({
            where: {
                STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
            },
            order: { NOME: 'ASC' }
        });

        return products.map((product) => 
        plainToInstance(ProductDto, product, {
            excludeExtraneousValues: true,
        }));
    }

    async findOne(id: number) {
        const product = await this.productRepository.findOne({
            where: { ID: id },
        });

        if (!product) {
            throw new NotFoundException('Produto não encontrado');
        };

        return product;
    }

    async update(
      id: number,
      dto: UpdateProductDto,
      req?: Request,
    ): Promise<ProductDto> {
      const product = await this.findActiveProductId(id);

      if (!dto.NOME) {
        throw new BadRequestException('Nome do produto é obrigatório');
      }

      const normalizeProductName = this.normalizeProductName(dto.NOME);
      const previousName = product.NOME;

      if (normalizeProductName === previousName) {
        return plainToInstance(ProductDto, product, {
            excludeExtraneousValues: true,
        });
      }

      const existingProduct = await this.findByName(normalizeProductName, id);

      if (existingProduct) {
        throw new BadRequestException(`Produto "${normalizeProductName}" já existe`);
      }

      product.NOME = normalizeProductName;

      const updatedProduct = await this.productRepository.save(product);

      this.logger.log(
        `Product ${id} updated from "${previousName}" to "${normalizeProductName}"`
      )

      return plainToInstance(ProductDto, updatedProduct, {
        excludeExtraneousValues: true,
      });
    }

    async remove(id: number) {
        const product = await this.findOne(id);

        await this.productRepository.remove(product);

        return {
            message: 'Produto removido com sucesso.'
        };
    }

    async updateStock(id: number, quantity: number) {
        const product = await this.findOne(id);

        product.QUANTIDADE = quantity;

        return await this.productRepository.save(product);
    }
}
