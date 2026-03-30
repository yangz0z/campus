import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChecklistTemplateTables1711800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create season enum
    await queryRunner.query(
      `CREATE TYPE "season" AS ENUM ('spring', 'summer', 'fall', 'winter')`,
    );

    // 2. Create checklist_template table
    await queryRunner.query(`
      CREATE TABLE "checklist_template" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" varchar(255) NOT NULL,
        "description" text,
        "owner_type" varchar(10) NOT NULL,
        "user_id" uuid,
        "source_template_id" uuid,
        "seasons" "season"[] NOT NULL DEFAULT '{spring,summer,fall,winter}',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_checklist_template" PRIMARY KEY ("id"),
        CONSTRAINT "chk_template_owner" CHECK (
          ("owner_type" = 'system' AND "user_id" IS NULL) OR
          ("owner_type" = 'user' AND "user_id" IS NOT NULL)
        ),
        CONSTRAINT "chk_template_seasons_not_empty" CHECK (
          array_length("seasons", 1) > 0
        ),
        CONSTRAINT "fk_template_source" FOREIGN KEY ("source_template_id")
          REFERENCES "checklist_template"("id") ON DELETE SET NULL
      )
    `);

    // Partial unique: one fork per user per source template
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_template_user_source"
        ON "checklist_template" ("user_id", "source_template_id")
        WHERE "source_template_id" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_template_user_id" ON "checklist_template" ("user_id")
    `);

    // 3. Create checklist_template_group table
    await queryRunner.query(`
      CREATE TABLE "checklist_template_group" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "template_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_checklist_template_group" PRIMARY KEY ("id"),
        CONSTRAINT "fk_group_template" FOREIGN KEY ("template_id")
          REFERENCES "checklist_template"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_group_sort" UNIQUE ("template_id", "sort_order")
      )
    `);

    // 4. Create checklist_template_item table
    await queryRunner.query(`
      CREATE TABLE "checklist_template_item" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "group_id" uuid NOT NULL,
        "title" varchar(500) NOT NULL,
        "description" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_required" boolean NOT NULL DEFAULT false,
        "seasons" "season"[] NOT NULL DEFAULT '{spring,summer,fall,winter}',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_checklist_template_item" PRIMARY KEY ("id"),
        CONSTRAINT "fk_item_group" FOREIGN KEY ("group_id")
          REFERENCES "checklist_template_group"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_item_sort" UNIQUE ("group_id", "sort_order"),
        CONSTRAINT "chk_item_seasons_not_empty" CHECK (
          array_length("seasons", 1) > 0
        )
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist_template_item"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist_template_group"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist_template"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "season"`);
  }
}
