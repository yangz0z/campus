import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1711800003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. user 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "provider" varchar(20) NOT NULL,
        "provider_id" varchar(255) NOT NULL,
        "email" varchar(255),
        "nickname" varchar(50) NOT NULL,
        "profile_image" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_user" PRIMARY KEY ("id"),
        CONSTRAINT "uq_user_provider" UNIQUE ("provider", "provider_id")
      )
    `);

    // 2. 기존 테이블에 FK 추가
    await queryRunner.query(`
      ALTER TABLE "checklist_template"
        ADD CONSTRAINT "fk_template_user"
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "camp"
        ADD CONSTRAINT "fk_camp_user"
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "camp_member"
        ADD CONSTRAINT "fk_camp_member_user"
        FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "camp_member" DROP CONSTRAINT IF EXISTS "fk_camp_member_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "camp" DROP CONSTRAINT IF EXISTS "fk_camp_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "checklist_template" DROP CONSTRAINT IF EXISTS "fk_template_user"
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
