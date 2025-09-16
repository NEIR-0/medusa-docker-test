- install docker dekstop and done setup first

instal:
1. npx create-medusa-app@latest backend
- nanti aksih tau username, password dan nama db (db harus di create manual dulu)

2. set up docker-compose.yml di paling luar setara ./backend dan ./backend-storefront
```js
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

3. Dockerfile di folder ./backend
```js
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

4. cd backend && npm install -D typescript ts-node

5. docker compose up --build

cmd docker:
# Stop container yang lama
docker-compose down

# Build ulang dengan perubahan baru
docker-compose build --no-cache

# Jalankan
docker-compose up