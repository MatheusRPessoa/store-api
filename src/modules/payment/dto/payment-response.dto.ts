import { PaymentMethodEnum } from 'src/modules/payment/enums/payment-method.enum';
import { PaymentStatusEnum } from 'src/modules/payment/enums/payment-status.enum';

export class PaymentOrderResponseDto {
  orderId: number;
  status: string;
  payment: {
    status: PaymentStatusEnum;
    method: PaymentMethodEnum;
    amount: number;
  };
}
