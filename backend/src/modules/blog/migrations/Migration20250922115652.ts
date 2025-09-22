// src/modules/blog/migrations/Migration20250922115652.ts
import { Migration } from '@mikro-orm/migrations';

export class Migration20250922115652 extends Migration {

  override async up(): Promise<void> {
    // Check if column already exists before adding
    this.addSql(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'post' AND column_name = 'subtitle'
        ) THEN
          ALTER TABLE "post" ADD COLUMN "subtitle" text NULL;
        END IF;
      END $$;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'post' AND column_name = 'subtitle'
        ) THEN
          ALTER TABLE "post" DROP COLUMN "subtitle";
        END IF;
      END $$;
    `);
  }

}