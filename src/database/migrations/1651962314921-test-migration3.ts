import {MigrationInterface, QueryRunner} from "typeorm";

export class testMigration31651962314921 implements MigrationInterface {
    name = 'testMigration31651962314921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_resets" ("reset_id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "reset_token" character varying(255) NOT NULL, CONSTRAINT "UQ_c6e3466f270c86c6edd43e1ac84" UNIQUE ("reset_token"), CONSTRAINT "PK_3087fa1ea9868bca21f966d7f5e" PRIMARY KEY ("reset_id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "email" character varying(255) NOT NULL, "first_name" character varying(255) NOT NULL, "last_name" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "profile_image_location" character varying(255), "profile_image_location" character varying(255), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "password_resets"`);
    }

}
