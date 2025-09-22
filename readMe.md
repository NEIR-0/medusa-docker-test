# Medusa Docker Setup Guide

## Prerequisites
- Install Docker Desktop and complete initial setup

## Initial Setup

### 1. Create Medusa App
```bash
npx create-medusa-app@latest backend
```
This will create two folders:
- `/backend`
- `/backend-storefront`

Note: The setup will ask for username, password, and database name. The database must be created manually first.

### 2. Access Points
- **Medusa API**: http://localhost:9000
- **Admin Panel**: http://localhost:9000/app
- **Database Admin (Adminer)**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: medusa
  - Password: medusa
  - Database: medusa-ecommerce

## TUTORIAL CREATE PRODCUT
1. create inventory
2. create prodcut
3. add shipping conifg di prodcut detail


## add column on medusa default table
docs: https://docs.medusajs.com/learn/fundamentals/modules#4-add-module-to-medusas-configurations
1. ke folder ./backend/src/modules. nah disini kita cretae folder base dari apa yang kita mau, example aku mau Blog
2. nah di dalam blog kita create 3 items:
```js
a. /models -> create di dalamnya file models, example di sini aku bikin post.ts
b. index.ts, buat base nanti di setup di medusa-config.ts
c. service.ts, buat servicenya dan logic
```
3. trus update medusa-config.ts jadi gini:
```js
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    // ...
  },
  modules: [
    {
      resolve: "./src/modules/blog", // ini tambahin
    },
  ],
})
```
4. jalankan comand:
npx medusa db:generate blog
- ini akan buat folder migrations di folder blog beserta migrationnya base on post.js

npx medusa db:migrate
- migrate ke db. done deh

npm run seed
- seeding

npx medusa user -e admin@example.com -p supersecret
- cretae user
- https://docs.medusajs.com/resources/medusa-cli/commands/user

5. nah next untuk test kita ikutin docs, create workflow dan api done deh
- api itu di luar admin dan store jadi gak perlu pakai token, whihc mean ini diluar auth. bagus untuk endpoint katalog


## continuesly add column di table yang sudah di migrate
example gw itu src/modules//blog
1. di src/modules//blog/models/posts.ts. kita add column:
  - subtitle: model.text().nullable(), 
2. update src/modules//blog/migrations/.snapshot-blog.json
```js
  "subtitle": {
    "name": "subtitle",
    "type": "text",
    "unsigned": false,
    "autoincrement": false,
    "primary": false,
    "nullable": true,
    "mappedType": "text"
  },
```
3. add migratiosn manual, simplenya copy paste yang sebelumny dan add +1 di belakang example:
sebelumnya: Migration20250922115651.ts
yang terbaru: Migration20250922115652.ts

4. npx medusa db:migrate

## relasi dan inputnya:
relasi default "user" table medusa
1. add model, simple. jadi relasinya pas migrations
```js
const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
  description: model.text().nullable(),
  subtitle: model.text().nullable(),
  user_id: model.text().nullable(), // medusa table
})
```
2. migrations, bikin migrations menggunakan query:
```js
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
      foreign key ("user_id") references "user" ("id") // disini
      on delete set null
      on update cascade;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "post" drop constraint "post_user_id_foreign";`);
    this.addSql(`alter table "post" drop column "user_id";`);
  }
}
```

nah jadi deh!!! cuman kita udah add inputan, cuman kita harus req.body nya flownya:
1. src/api/blog/posts/**routes.ts
example kayak gini:
```js
const input = {
  ...req.body,
  user_id: userInfo?.id,
} as CreatePostWorkflowInput // input type
```

2. src/workflows/post-workflows.ts
```js
export type CreatePostWorkflowInput = {
  title: string,
  description?: string
  subtitle?: string
  user_id?: string
}

async (input: CreatePostWorkflowInput, { container }) => { // disini
  ...
}
```

3. src/modules/blog/services.ts
```js
async createPost(data: { title: string; description: string; subtitle: string; user_id: string }) { // disini nya 
  return await this.createPosts(data) // ✅
}
```