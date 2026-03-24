import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

@Entity('PAGAMENTOS')
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({
    name: 'ID_PEDIDO',
    type: 'int',
  })
  ID_PEDIDO: number;

  @Column({
    name: 'VALOR',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  VALOR: number;

  @Column({
    name: 'STATUS_PAGAMENTO',
    type: 'varchar',
    length: 20,
    default: PaymentStatusEnum.PENDENTE,
  })
  STATUS_PAGAMENTO: PaymentStatusEnum;

  @Column({
    name: 'METODO',
    type: 'varchar',
    length: 20,
  })
  METODO: PaymentMethodEnum;

  @CreateDateColumn({
    type: 'timestamp',
  })
  CRIADO_EM: Date;
}
