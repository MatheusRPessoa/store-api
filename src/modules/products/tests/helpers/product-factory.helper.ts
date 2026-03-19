import { ProductDto } from '../../dto/products-response.dto';
import { createProduct } from './product.helper';

export class ProductFactory {
  static async create(): Promise<ProductDto> {
    const response = await createProduct();

    if (!response.body.data) {
      throw new Error('Product not created in factory');
    }

    return response.body.data as ProductDto;
  }
}
