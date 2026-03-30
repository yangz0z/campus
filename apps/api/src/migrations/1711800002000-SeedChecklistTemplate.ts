import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedChecklistTemplate1711800002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 시스템 공통 템플릿
    await queryRunner.query(`
      INSERT INTO "checklist_template" ("id", "title", "owner_type", "user_id", "seasons")
      VALUES (
        'a0000000-0000-0000-0000-000000000001',
        '캠핑 체크리스트',
        'system',
        NULL,
        '{spring,summer,fall,winter}'
      )
    `);

    // 그룹 1: 사전준비
    await queryRunner.query(`
      INSERT INTO "checklist_template_group" ("id", "template_id", "title", "sort_order")
      VALUES (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        '사전준비',
        0
      )
    `);

    await queryRunner.query(`
      INSERT INTO "checklist_template_item" ("group_id", "title", "sort_order", "seasons") VALUES
        ('b0000000-0000-0000-0000-000000000001', '사이트 예약',                          0, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000001', '숯/그릴',                              1, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000001', '숯통/토치',                            2, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000001', '보조배터리',                           3, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000001', '기기 충전(랜턴/선풍기/경보기/에어건)',  4, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000001', '난로',                                 5, '{fall,winter}'),
        ('b0000000-0000-0000-0000-000000000001', '등유',                                 6, '{fall,winter}'),
        ('b0000000-0000-0000-0000-000000000001', '방석핫팩',                             7, '{fall,winter}')
    `);

    // 그룹 2: 식품
    await queryRunner.query(`
      INSERT INTO "checklist_template_group" ("id", "template_id", "title", "sort_order")
      VALUES (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        '식품',
        1
      )
    `);

    await queryRunner.query(`
      INSERT INTO "checklist_template_item" ("group_id", "title", "sort_order", "seasons") VALUES
        ('b0000000-0000-0000-0000-000000000002', '물',          0, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000002', '커피',        1, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000002', '술(+재료)',   2, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000002', '술 얼음컵',   3, '{summer}'),
        ('b0000000-0000-0000-0000-000000000002', '아침식사',    4, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000002', '점심식사',    5, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000002', '저녁식사',    6, '{spring,summer,fall,winter}')
    `);

    // 그룹 3: 준비물
    await queryRunner.query(`
      INSERT INTO "checklist_template_group" ("id", "template_id", "title", "sort_order")
      VALUES (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        '준비물',
        2
      )
    `);

    await queryRunner.query(`
      INSERT INTO "checklist_template_item" ("group_id", "title", "sort_order", "seasons") VALUES
        ('b0000000-0000-0000-0000-000000000003', '텐트',                    0,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '에어베드',                1,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '침낭',                    2,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '베개',                    3,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '테이블',                  4,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '의자',                    5,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '선반',                    6,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '랜턴/삼각대',             7,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '토르박스',                8,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '아이스박스',              9,  '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '릴선',                    10, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '팩가방',                  11, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '식기가방',                12, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '설거지 가방',             13, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '조미료/쿠킹호일/접시',    14, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '수건',                    15, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '세면도구',                16, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '물티슈',                  17, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '키친타올',                18, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '모자',                    19, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '감성 더하기/스피커',      20, '{spring,summer,fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '일산화탄소 경보기',       21, '{fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '전기장판',                22, '{fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '핫팩',                    23, '{fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '수면양말',                24, '{fall,winter}'),
        ('b0000000-0000-0000-0000-000000000003', '선풍기',                  25, '{summer}'),
        ('b0000000-0000-0000-0000-000000000003', '워터저그',                26, '{summer}'),
        ('b0000000-0000-0000-0000-000000000003', '타프',                    27, '{summer}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "checklist_template" WHERE "id" = 'a0000000-0000-0000-0000-000000000001'
    `);
  }
}
