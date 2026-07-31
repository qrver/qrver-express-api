import mongoose from 'mongoose';

import { createApp } from './app.js';
import { assertConfig, config } from './config/env.js';

let server;

const closeServer = async (signal) => {
  console.log(`Получен сигнал ${signal}, завершаем работу`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.disconnect();
};

const start = async () => {
  assertConfig();

  await mongoose.connect(config.mongoUri);
  console.log('DB OK');

  const app = createApp();

  server = app.listen(config.port, () => {
    console.log(`Сервер запущен на порту: ${config.port}`);
  });
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    closeServer(signal)
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Ошибка при завершении приложения', error.message);
        process.exit(1);
      });
  });
}

start().catch((error) => {
  console.error('Не удалось запустить приложение', error.message);
  process.exit(1);
});
