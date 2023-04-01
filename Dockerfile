FROM node:16.3.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

## Add source
COPY . .

CMD ["node" , "index.js"]
