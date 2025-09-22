// src/modules/blog/migrations/Migration20250922115653.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20250922115653 extends Migration {
override async up(): Promise<void> {
    this.addSql(`
      alter table "post"
      add column "user_id" text null;
    `);

    this.addSql(`
      alter table "post"
      add constraint "post_user_id_foreign"
      foreign key ("user_id") references "user" ("id")
      on delete set null
      on update cascade;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "post" drop constraint "post_user_id_foreign";`);
    this.addSql(`alter table "post" drop column "user_id";`);
  }
}