import express from "express";
import mongoose from 'mongoose';
import multer from 'multer';
import 'dotenv/config'

import * as src from './src/import.js';

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

app.post('/auth/login', src.loginValidation, src.ValidationErr, src.UserController.login);
app.post('/auth/register', src.registerValidation, src.ValidationErr, src.UserController.register);
app.get('/auth/me', src.checkAuth, src.UserController.getMe);

// Posts

app.get('/posts', src.PostController.getAll);
app.get('/posts/:id', src.PostController.getOne);
app.post('/posts', src.checkAuth, src.postCreateValidation, src.ValidationErr, src.PostController.create);
app.patch('/posts/:id', src.checkAuth, src.postCreateValidation, src.ValidationErr, src.PostController.update);
app.delete('/posts/:id', src.checkAuth, src.PostController.remove);

// Files

app.use('/uploads', express.static(`${process.env.UPLOADS_DIR}`));

app.post('/upload', src.checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/${process.env.UPLOADS_DIR}/${req.file.originalname}`
  })
});

// Сервер

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log(`Сервер запущен на порту: ${PORT}`);
});

export default app;