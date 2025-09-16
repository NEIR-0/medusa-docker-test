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
