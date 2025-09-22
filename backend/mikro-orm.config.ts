import { defineConfig } from "@mikro-orm/postgresql"
import dotenv from "dotenv"

// load env dari file .env
dotenv.config()

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,  // pakai DATABASE_URL
  entities: ["./dist/models"],
  entitiesTs: ["./src/models"],
  migrations: {
    path: "./src/migrations",
    pathTs: "./src/migrations",
  },
})
