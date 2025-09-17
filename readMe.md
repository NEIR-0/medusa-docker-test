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

### 2. Install TypeScript Dependencies
```bash
cd backend && npm install -D typescript ts-node
```

### 3. Create docker-compose.yml
Create this file in the root directory (same level as `./backend` and `./backend-storefront`):

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15
    container_name: medusa_postgres
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: medusa
      POSTGRES_DB: medusa_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: medusa_redis
    ports:
      - "6379:6379"

  medusa:
    build: ./backend
    container_name: medusa_backend
    environment:
      DATABASE_URL: postgres://medusa:medusa@postgres:5432/medusa_db
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
      PORT: 9000
    ports:
      - "9000:9000"
    volumes:
      - ./backend:/app
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### 4. Create Dockerfile
Create this file in `./backend/Dockerfile`:

```dockerfile
FROM node:18

# set working dir
WORKDIR /app

# copy package.json dan lockfile dulu (biar cache efisien)
COPY package*.json ./

# install dependencies
RUN npm install

# copy seluruh source code
COPY . .

# expose port 9000
EXPOSE 9000

# start Medusa
CMD ["npm", "run", "start"]
```

### 5. Build and Run
```bash
docker-compose up --build
```

## Docker Commands

```bash
# Stop old containers
docker-compose down

# Rebuild with changes (no cache)
docker-compose build --no-cache

# Run containers
docker-compose up
```

---

## Update 17/09/2025

### 1. Convert medusa-config.ts to medusa-config.js
Rename `medusa-config.ts` to `medusa-config.js` and update the content:

```javascript
const { loadEnv, defineConfig } = require('@medusajs/framework/utils')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      ssl: false
    },
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:7001",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  }
})
```

### 2. Update docker-compose.yml
Replace with the updated configuration:

```yaml
services:
  postgres:
    image: postgres:15
    container_name: medusa_postgres
    environment:
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: medusa
      POSTGRES_DB: medusa-ecommerce
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: medusa_redis
    ports:
      - "6379:6379"

  medusa:
    build: ./backend
    container_name: medusa_backend
    environment:
      DATABASE_URL: postgres://medusa:medusa@postgres:5432/medusa-ecommerce?sslmode=disable
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
      PORT: 9000
      STORE_CORS: "http://localhost:8000"
      ADMIN_CORS: "http://localhost:7001,http://localhost:7000"
      AUTH_CORS: "http://localhost:7001,http://localhost:7000"
      JWT_SECRET: "supersecret"
      COOKIE_SECRET: "supersecret"
    ports:
      - "9000:9000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  adminer:
    image: adminer
    container_name: medusa_adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 3. Update Dockerfile
Replace `./backend/Dockerfile` with:

```dockerfile
FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 9000

# Default command
CMD ["npm", "run", "dev"]
```

### 4. Database Setup
Run database migration and setup:

```bash
# Start database and redis first
docker-compose up -d postgres redis

# Wait for database to be ready
sleep 15

# Run database setup
docker-compose run --rm medusa npx medusa db:setup

# Start all services
docker-compose up -d
```

### 5. Access Points
- **Medusa API**: http://localhost:9000
- **Admin Panel**: http://localhost:9000/app
- **Database Admin (Adminer)**: http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: medusa
  - Password: medusa
  - Database: medusa-ecommerce

## Troubleshooting

### Clean Setup
If you need to start completely fresh:

```bash
# Stop all containers
docker-compose down

# Remove volumes (deletes all data)
docker volume prune -f

# Rebuild and restart
docker-compose up --build
```

### Check Logs
```bash
# View logs for specific service
docker-compose logs medusa
docker-compose logs postgres

# View all logs
docker-compose logs
```

## TUTORIAL CREATE PRODCUT
1. create inventory
2. create prodcut
3. add shipping conifg di prodcut detail