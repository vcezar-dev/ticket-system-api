import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTicketsTable1775683490071 implements MigrationInterface {
    name = 'CreateTicketsTable1775683490071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ticket_status_enum" AS ENUM('open', 'in_progress', 'resolved', 'closed')`);
        await queryRunner.query(`CREATE TYPE "public"."ticket_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TYPE "public"."ticket_category_enum" AS ENUM('bug', 'feature_request', 'support', 'improvement', 'other')`);
        await queryRunner.query(`CREATE TABLE "ticket" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" character varying(300) NOT NULL, "status" "public"."ticket_status_enum" NOT NULL DEFAULT 'open', "priority" "public"."ticket_priority_enum" NOT NULL DEFAULT 'low', "category" "public"."ticket_category_enum" NOT NULL DEFAULT 'other', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "created_by_id" uuid, "assigned_to_id" uuid, CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_b86ac78717c90b582de33ec0f77" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_a307fbede31c564a1ad3a7df2c8" FOREIGN KEY ("assigned_to_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_a307fbede31c564a1ad3a7df2c8"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_b86ac78717c90b582de33ec0f77"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_status_enum"`);
    }

}
