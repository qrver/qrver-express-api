FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force

COPY . .

RUN mkdir -p /app/uploads \
  && chown -R node:node /app

USER node

EXPOSE 4444

CMD ["npm", "start"]
