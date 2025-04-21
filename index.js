import express from "express";
import mongoose from 'mongoose';
import multer from 'multer';
import 'dotenv/config'

import {
  UserController,
  PostController
} from './controllers/index.js';

import {
  checkAuth,
  ValidationErr
} from './utils/index.js';

import {
  registerValidation,
  loginValidation,
  postCreateValidation
} from './validations/verify.js';

// Подключение к б/д

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(uri)
  .then(() => console.log("DB OK"))
  .catch((err) => console.log("DB ERROR", err));

// Приложение

const app = express();

const PORT = process.env.PORT || 4444;

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
})

const upload = multer({ storage });

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`Приложение запущено на порту ${PORT}`);
});

// User

app.post('/auth/login', loginValidation, ValidationErr, UserController.login);
app.post('/auth/register', registerValidation, ValidationErr, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

// Posts

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, ValidationErr, PostController.create);
app.patch('/posts/:id', checkAuth, PostController.update);
app.delete('/posts/:id', checkAuth, ValidationErr, PostController.remove);

// Files

app.use('/uploads', express.static('uploads'));

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
});

// Сервер

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log(`Сервер запущен на порту: ${PORT}`);
});