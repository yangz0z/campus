import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCampTables1711800001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. camp
    await queryRunner.query(`
      CREATE TABLE "camp" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "location" varchar(255),
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "season" "season" NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_camp" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_camp_user_id" ON "camp" ("user_id")
    `);

    // 2. camp_member
    await queryRunner.query(`
      CREATE TABLE "camp_member" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" varchar(10) NOT NULL DEFAULT 'member',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_camp_member" PRIMARY KEY ("id"),
        CONSTRAINT "fk_camp_member_camp" FOREIGN KEY ("camp_id")
          REFERENCES "camp"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_camp_member" UNIQUE ("camp_id", "user_id")
      )
    `);

    // 3. camp_checklist_group
    await queryRunner.query(`
      CREATE TABLE "camp_checklist_group" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "camp_id" uuid NOT NULL,
        "source_group_id" uuid,
        "title" varchar(255) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_camp_checklist_group" PRIMARY KEY ("id"),
        CONSTRAINT "fk_camp_checklist_group_camp" FOREIGN KEY ("camp_id")
          REFERENCES "camp"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_camp_checklist_group_source" FOREIGN KEY ("source_group_id")
          REFERENCES "checklist_template_group"("id") ON DELETE SET NULL,
        CONSTRAINT "uq_camp_checklist_group_sort" UNIQUE ("camp_id", "sort_order")
      )
    `);

    // 4. camp_checklist_item
    await queryRunner.query(`
      CREATE TABLE "camp_checklist_item" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "group_id" uuid NOT NULL,
        "source_item_id" uuid,
        "title" varchar(500) NOT NULL,
        "memo" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_required" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "pk_camp_checklist_item" PRIMARY KEY ("id"),
        CONSTRAINT "fk_camp_checklist_item_group" FOREIGN KEY ("group_id")
          REFERENCES "camp_checklist_group"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_camp_checklist_item_source" FOREIGN KEY ("source_item_id")
          REFERENCES "checklist_template_item"("id") ON DELETE SET NULL,
        CONSTRAINT "uq_camp_checklist_item_sort" UNIQUE ("group_id", "sort_order")
      )
    `);

    // 5. camp_checklist_item_assignee
    await queryRunner.query(`
      CREATE TABLE "camp_checklist_item_assignee" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "item_id" uuid NOT NULL,
        "member_id" uuid NOT NULL,
        "is_checked" boolean NOT NULL DEFAULT false,
        "checked_at" timestamptz,
        CONSTRAINT "pk_camp_checklist_item_assignee" PRIMARY KEY ("id"),
        CONSTRAINT "fk_assignee_item" FOREIGN KEY ("item_id")
          REFERENCES "camp_checklist_item"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_assignee_member" FOREIGN KEY ("member_id")
          REFERENCES "camp_member"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_item_assignee" UNIQUE ("item_id", "member_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "camp_checklist_item_assignee"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "camp_checklist_item"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "camp_checklist_group"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "camp_member"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "camp"`);
  }
}
