import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommentsTable1775702533133 implements MigrationInterface {
    name = 'CreateCommentsTable1775702533133'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying(300) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ticket_id" uuid, "author_id" uuid, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_9bf3c241d95fc8493047444f5ff" FOREIGN KEY ("ticket_id") REFERENCES "ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_3ce66469b26697baa097f8da923" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_3ce66469b26697baa097f8da923"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_9bf3c241d95fc8493047444f5ff"`);
        await queryRunner.query(`DROP TABLE "comment"`);
    }

}
