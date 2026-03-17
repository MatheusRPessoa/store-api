import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ProductEntity } from './entities/product.entity';
import { DataSource, ILike, Not, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from './dto/products-response.dto';
import { BaseEntityStatusEnum } from '../config/database/entities/enums/base-entity-status.enum';
import { UpdateProductDto } from './dto/update-product.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PRODUCT_EVENTS } from './events/product-event.contants';
import { ProductDeletedEvent } from './events/product-deleted.event';
import { UsersService } from 'src/users/users.service';
import { ProductCreatedEvent } from './events/product-created.event';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly user: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private normalizeProductName(name: string): string {
    const unitsUpper = ['l', 'ml']; // unidades que ficam em maiúsculo
    const unitsLower = ['g', 'kg']; // unidades que ficam em minúsculo

    return name
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => {
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
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
      throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }

    return product;
  }

  async findByName(name: string, excludeId?: number): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: {
        NOME: ILike(`%${name}`),
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
        ...(excludeId && { ID: Not(excludeId) }),
      },
      order: { NOME: 'ASC' },
    });

    if (!products.length) {
      throw new NotFoundException(`Produto "${name}" não encontrado`);
    }

    return products.map((product) =>
      plainToInstance(ProductDto, product, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async create(dto: CreateProductDto, username: string): Promise<ProductDto> {
    const user = await this.user.findByUsername(username);

    const normalizeProductName = this.normalizeProductName(dto.NOME);

    const existingProduct = await this.productRepository.findOne({
      where: {
        NOME: normalizeProductName,
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
    });

    if (existingProduct) {
      throw new BadRequestException(
        `Produto "${normalizeProductName}" já existe`,
      );
    }

    const product = this.productRepository.create({
      ...dto,
      NOME: normalizeProductName,
      CRIADO_POR: user.NOME_USUARIO,
    });

    const savedProduct = await this.productRepository.save(product);

    this.eventEmitter.emit(
      PRODUCT_EVENTS.CREATED,
      new ProductCreatedEvent(savedProduct.ID, savedProduct.NOME),
    );

    return plainToInstance(ProductDto, savedProduct, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: {
        STATUS: Not(BaseEntityStatusEnum.EXCLUIDO),
      },
      order: { NOME: 'ASC' },
    });

    return products.map((product) =>
      plainToInstance(ProductDto, product, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { ID: id },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    username: string,
  ): Promise<ProductDto> {
    const user = await this.user.findByUsername(username);

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
      throw new BadRequestException(
        `Produto "${normalizeProductName}" já existe`,
      );
    }

    product.NOME = normalizeProductName;
    product.ATUALIZADO_POR = user.NOME_USUARIO;

    const updatedProduct = await this.productRepository.save(product);

    this.logger.log(
      `Product ${id} updated from "${previousName}" to "${normalizeProductName}" by ${user.NOME_USUARIO}`,
    );

    return plainToInstance(ProductDto, updatedProduct, {
      excludeExtraneousValues: true,
    });
  }

  async delete(id: number, username: string, req?: Request): Promise<void> {
    const user = await this.user.findByUsername(username);

    const product = await this.findActiveProductId(id);

    await this.dataSource.transaction(async (manager) => {
      product.STATUS = BaseEntityStatusEnum.EXCLUIDO;
      product.EXCLUIDO_POR = user.NOME_USUARIO;

      await manager.save(product);
    });

    this.eventEmitter.emit(
      PRODUCT_EVENTS.CREATED,
      new ProductDeletedEvent(id, product.NOME, req),
    );

    this.logger.log(
      `Product ${id} (${product.NOME}) deleted by ${user.NOME_USUARIO}`,
    );
  }

  async updateStock(id: number, quantity: number) {
    const product = await this.findOne(id);

    product.QUANTIDADE = quantity;

    return await this.productRepository.save(product);
  }
}
