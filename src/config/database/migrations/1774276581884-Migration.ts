import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1774276581884 implements MigrationInterface {
  name = 'Migration1774276581884';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "USUARIOS" ("ID" SERIAL NOT NULL, "NOME_USUARIO" character varying(255) NOT NULL, "EMAIL" character varying(255) NOT NULL, "SENHA" character varying(255) NOT NULL, "REFRESH_TOKEN" character varying(500), "STATUS" character varying(20) NOT NULL DEFAULT 'ATIVO', "ATUALIZADO_POR" character varying(20), "EXCLUIDO_POR" character varying(20), "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a40d3672036469cda0609a04423" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PRODUTOS" ("ID" SERIAL NOT NULL, "NOME" character varying(255) NOT NULL, "DESCRICAO" character varying(255) NOT NULL, "PRECO" numeric(10,2) NOT NULL, "QUANTIDADE" integer NOT NULL, "CRIADO_POR" character varying(20) NOT NULL, "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(), "STATUS" character varying(20) NOT NULL DEFAULT 'ATIVO', "ATUALIZADO_POR" character varying(20), "EXCLUIDO_POR" character varying(20), CONSTRAINT "PK_9677f12badb9a69e23876f2d9cd" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PAGAMENTOS" ("ID" SERIAL NOT NULL, "ID_PEDIDO" integer NOT NULL, "VALOR" numeric(10,2) NOT NULL, "STATUS_PAGAMENTO" character varying(20) NOT NULL DEFAULT 'PENDENTE', "METODO" character varying(20) NOT NULL, "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_842079d886065b9be69ae725fe7" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ITENS_PEDIDO" ("ID" SERIAL NOT NULL, "ID_PRODUTO" integer NOT NULL, "QUANTIDADE" integer NOT NULL, "PRECO" double precision NOT NULL, "ORDERID" integer, CONSTRAINT "PK_c264e5af48ca53dfa903ec73e20" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "PEDIDOS" ("ID" SERIAL NOT NULL, "USER_ID" integer NOT NULL, "TOTAL" double precision NOT NULL, "CRIADO_POR" character varying(20) NOT NULL, "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(), "STATUS" character varying NOT NULL DEFAULT 'ATIVO', "STATUS_PEDIDO" character varying NOT NULL DEFAULT 'PENDENTE', "ATUALIZADO_POR" character varying(20), "EXCLUIDO_POR" character varying(20), CONSTRAINT "PK_0efcc27d17c6956e3d4823b6827" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ITENS_PEDIDO" ADD CONSTRAINT "FK_4944c3d0404e15bb2fdaf3d1637" FOREIGN KEY ("ORDERID") REFERENCES "PEDIDOS"("ID") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ITENS_PEDIDO" DROP CONSTRAINT "FK_4944c3d0404e15bb2fdaf3d1637"`,
    );
    await queryRunner.query(`DROP TABLE "PEDIDOS"`);
    await queryRunner.query(`DROP TABLE "ITENS_PEDIDO"`);
    await queryRunner.query(`DROP TABLE "PAGAMENTOS"`);
    await queryRunner.query(`DROP TABLE "PRODUTOS"`);
    await queryRunner.query(`DROP TABLE "USUARIOS"`);
  }
}
