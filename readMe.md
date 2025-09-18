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

5. nah next untuk test kita ikutin docs, create workflow dan api done deh
- api itu di luar admin dan store jadi gak perlu pakai token, whihc mean ini diluar auth. bagus untuk endpoint katalog