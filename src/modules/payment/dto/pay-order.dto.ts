import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

export class PayOrderDto {
  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  method: PaymentMethodEnum;
}
