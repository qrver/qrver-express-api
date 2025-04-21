ARG NODE_VERSION=23
ARG NODE_ENV=production

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

RUN apk update && apk upgrade

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 4444

CMD ["npm", "start"]