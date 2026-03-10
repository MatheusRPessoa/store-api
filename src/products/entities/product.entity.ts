import { BaseEntityStatusEnum } from "src/config/database/entities/enums/base-entity-status.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('MERCADORIA')
export class ProductEntity {
    @PrimaryGeneratedColumn()
    ID: number;

    @Column({
      name: 'NOME',
      type: 'text',
      length: 255,
    })
    NOME: string;

    @Column({
      name: 'DESCRICAO',
      type: 'text',
      length: 255, 
    })
    DESCRICAO: string;

    @Column({
      name: 'PRECO',
      type: Number, 
    })
    PRECO: number;

    @Column({
      name: 'QUANTIDADE',
      type: Number
    })
    QUANTIDADE: number;

    @Column({
      name: 'CRIADO_POR',
      type: 'text',
      length: 20   
    })
    CRIADO_POR: string;

    @CreateDateColumn({
        type: 'datetime',
    })
    CRIADO_EM: Date;

    @Column({
      name: 'STATUS',
      type: 'text',
      length: 20,
      default: BaseEntityStatusEnum.ATIVO,
    })
    STATUS: BaseEntityStatusEnum;
}