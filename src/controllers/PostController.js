import PostModel from '../models/post.js';
import { sendTelegramMessage } from '../utils/telegram.js';

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId
    });

    const post = await doc.save();

    // Отправка уведомления в Telegram
    try {
      const user = req.userId;
      await sendTelegramMessage(`📝 Новый пост: "${post.title}"\nАвтор: ${user}`);
    } catch (e) {
      console.error('Ошибка отправки уведомления в Telegram:', e);
    }

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать пост'
    });
  }
}

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи'
    });
  }
}

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: 'after',
      }
    ).populate('user').exec();

    if (!doc) {
      return res.status(404).json({
        message: 'Статья не найдена'
      })
    }

    res.json(doc);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статью'
    });
  }
}

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findOneAndDelete(
      {
        _id: postId,
      }
    );

    if (!doc) {
      res.status(404).json({
        message: 'Статья не найдена'
      })
    }

    return res.json({
      success: true,
      post: doc
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Не удалось удалить статью'
    });
  }
}

export const update = async (req, res) => {
  try {
    const postId = req.params.id

    const doc = await PostModel.updateOne(
      {
        _id: postId
      },
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        user: req.userId,
        tags: req.body.tags
      },
    )

    res.json({
      success: true
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: 'Не удалось обновить статью'
    });
  }
}