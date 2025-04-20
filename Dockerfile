FROM node:23-alpine

WORKDIR /app

RUN apk update && apk upgrade

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 4444

CMD ["npm", "start"]