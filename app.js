import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import express from 'express';
import multer from 'multer';

import { UserController, PostController } from './controllers/index.js';
import { checkAuth, ValidationErr } from './utils/index.js';
import { config } from './config/env.js';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations/verify.js';

export const createApp = () => {
  const app = express();
  const uploadsDir = path.resolve(config.uploadsDir);

  fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${extension}`);
    },
  });

  const upload = multer({ storage });

  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_, res) => {
    res.json({
      name: 'qrver-express-api',
      status: 'ok',
    });
  });

  app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/auth/login', loginValidation, ValidationErr, UserController.login);
  app.post('/auth/register', registerValidation, ValidationErr, UserController.register);
  app.get('/auth/me', checkAuth, UserController.getMe);

  app.get('/posts', PostController.getAll);
  app.get('/posts/:id', PostController.getOne);
  app.post('/posts', checkAuth, postCreateValidation, ValidationErr, PostController.create);
  app.patch('/posts/:id', checkAuth, postCreateValidation, ValidationErr, PostController.update);
  app.delete('/posts/:id', checkAuth, PostController.remove);

  app.use('/uploads', express.static(uploadsDir));

  app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Изображение не загружено' });
    }

    return res.json({
      url: `/uploads/${encodeURIComponent(req.file.filename)}`,
    });
  });

  return app;
};
