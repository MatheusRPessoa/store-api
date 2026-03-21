import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773852250886 implements MigrationInterface {
  name = 'Migrations1773852250886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "USUARIOS" (
                "ID" SERIAL NOT NULL,
                "NOME_USUARIO" character varying(255) NOT NULL,
                "EMAIL" character varying(255) NOT NULL,
                "SENHA" character varying(255) NOT NULL,
                "STATUS" character varying(20) NOT NULL DEFAULT 'ATIVO',
                "ATUALIZADO_POR" character varying(20),
                "EXCLUIDO_POR" character varying(20),
                "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_USUARIOS" PRIMARY KEY ("ID")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "MERCADORIA" (
                "ID" SERIAL NOT NULL,
                "NOME" character varying(255) NOT NULL,
                "DESCRICAO" character varying(255) NOT NULL,
                "PRECO" numeric(10,2) NOT NULL,
                "QUANTIDADE" integer NOT NULL,
                "CRIADO_POR" character varying(20) NOT NULL,
                "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(),
                "STATUS" character varying(20) NOT NULL DEFAULT 'ATIVO',
                "ATUALIZADO_POR" character varying(20),
                "EXCLUIDO_POR" character varying(20),
                CONSTRAINT "PK_MERCADORIA" PRIMARY KEY ("ID")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "PEDIDOS" (
                "ID" SERIAL NOT NULL,
                "USER_ID" integer NOT NULL,
                "TOTAL" numeric(10,2) NOT NULL,
                "CRIADO_POR" character varying(20) NOT NULL,
                "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(),
                "STATUS" character varying(20) NOT NULL DEFAULT 'ATIVO',
                "ATUALIZADO_POR" character varying(20),
                "EXCLUIDO_POR" character varying(20),
                CONSTRAINT "PK_PEDIDOS" PRIMARY KEY ("ID")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "ITENS_PEDIDO" (
                "ID" SERIAL NOT NULL,
                "ID_PRODUTO" integer NOT NULL,
                "ID_PEDIDO" integer NOT NULL,
                "QUANTIDADE" integer NOT NULL,
                "PRECO" numeric(10,2) NOT NULL,
                CONSTRAINT "PK_ITENS_PEDIDO" PRIMARY KEY ("ID")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "ITENS_PEDIDO"
            ADD CONSTRAINT "FK_ITENS_PEDIDO_PEDIDO"
            FOREIGN KEY ("ID_PEDIDO")
            REFERENCES "PEDIDOS"("ID")
            ON DELETE CASCADE
        `);

    await queryRunner.query(`
            ALTER TABLE "ITENS_PEDIDO"
            ADD CONSTRAINT "FK_ITENS_PEDIDO_PRODUTO"
            FOREIGN KEY ("ID_PRODUTO")
            REFERENCES "MERCADORIA"("ID")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ITENS_PEDIDO" DROP CONSTRAINT "FK_ITENS_PEDIDO_PRODUTO"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ITENS_PEDIDO" DROP CONSTRAINT "FK_ITENS_PEDIDO_PEDIDO"`,
    );
    await queryRunner.query(`DROP TABLE "ITENS_PEDIDO"`);
    await queryRunner.query(`DROP TABLE "PEDIDOS"`);
    await queryRunner.query(`DROP TABLE "MERCADORIA"`);
    await queryRunner.query(`DROP TABLE "USUARIOS"`);
  }
}
