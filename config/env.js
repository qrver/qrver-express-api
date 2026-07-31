import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const legacyMongoUri = () => {
  const values = [
    process.env.MONGO_USER,
    process.env.MONGO_PASSWORD,
    process.env.MONGO_CLUSTER,
    process.env.MONGO_DATABASE,
  ];

  if (values.some((value) => !value)) {
    return '';
  }

  const [user, password, cluster, database] = values;
  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${cluster}/${database}?retryWrites=true&w=majority&appName=qrver-express-api`;
};

export const config = {
  port: Number(process.env.PORT || 4444),
  mongoUri: process.env.MONGO_URI || legacyMongoUri(),
  jwtSecret: process.env.JWT_SECRET || process.env.SECRET || '',
  uploadsDir: process.env.UPLOADS_DIR || 'uploads',
};

export const assertConfig = () => {
  const missing = [];

  if (!config.mongoUri) {
    missing.push('MONGO_URI');
  }

  if (!config.jwtSecret) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(`Не заданы обязательные переменные окружения: ${missing.join(', ')}`);
  }

  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error('PORT должен быть целым числом от 1 до 65535');
  }
};
