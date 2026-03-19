import { ProductFactory } from '../../../../modules/products/tests/helpers/product-factory.helper';
import { createOrder } from './order.helper';

interface CreateOrderFactoryParams {
  items?: { ID_PRODUTO: number; QUANTIDADE: number }[];
}

export class OrderFactory {
  static async create(params?: CreateOrderFactoryParams) {
    let items = params?.items;

    if (!items || items.length === 0) {
      const product = await ProductFactory.create();

      items = [
        {
          ID_PRODUTO: product.ID,
          QUANTIDADE: 1,
        },
      ];
    }

    const response = await createOrder(
      items.map((item) => ({
        ID_PRODUTO: item.ID_PRODUTO,
        QUANTIDADE: item.QUANTIDADE,
      })),
    );

    if (!response.body.data) {
      throw new Error('Order not created in factory');
    }

    return response.body.data;
  }
}
