import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1773947337055 implements MigrationInterface {
  name = 'Migrations1773947337055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "PAGAMENTO" ("ID" SERIAL NOT NULL, "ID_PEDIDO" integer NOT NULL, "VALOR" numeric(10,2) NOT NULL, "STATUS_PAGAMENTO" character varying(20) NOT NULL DEFAULT 'PENDENTE', "METODO" character varying(20) NOT NULL, "CRIADO_EM" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6aa2d82368ac2e018f67a602073" PRIMARY KEY ("ID"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "PEDIDOS" ADD "STATUS_PEDIDO" character varying NOT NULL DEFAULT 'PENDENTE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PEDIDOS" DROP COLUMN "STATUS_PEDIDO"`,
    );
    await queryRunner.query(`DROP TABLE "PAGAMENTO"`);
  }
}
