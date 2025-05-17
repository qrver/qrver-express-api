ARG NODE_VERSION=23

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

RUN apk update && apk upgrade

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 4444

HEALTHCHECK --interval=600s --timeout=10s --start-period=30s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4444/ || exit 1

CMD ["npm", "start"]