import { MigrationInterface, QueryRunner } from "typeorm";

export class testMigration1651832902055 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "first_name" TO "first_name"`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName"`,
        )
    }

}
