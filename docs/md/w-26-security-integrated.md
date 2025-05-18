# Аудит и разбор внедрения мер безопасности в Express-JS-Pet

## Аутентификация и регистрация пользователя

В проекте реализована регистрация и вход пользователя с использованием email и пароля. Пароль хранится в базе данных в зашифрованном виде с помощью bcrypt. Для усиления безопасности при хешировании используется соль - случайная строка, которая добавляется к паролю перед хешированием. Это предотвращает использование радужных таблиц и делает взлом хешей значительно сложнее, даже если два пользователя используют одинаковые пароли.

**Регистрация пользователя:**

```js
// src/controllers/UserController.js
export const register = async (req, res) => {
  try {  
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
  
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    })
  
    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id
      },
      process.env.SECRET,
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc;
  
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать пользователя'
    });
  }
};
```

- Пароль пользователя не хранится в открытом виде, а только его хэш.
- Для генерации токена используется секрет из переменных окружения.

**Аутентификация (вход):**

```js
export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

    if (!isValidPass) {
      return res.status(404).json({
        message: 'Неверный логин или пароль'
      });
    }

    const token = jwt.sign(
      {
        _id: user._id
      },
      process.env.SECRET,
      {
        expiresIn: '30d',
      }
    )

    const { passwordHash, ...userData } = user._doc;
  
    res.json({
      ...userData,
      token
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось авторизоваться'
    });
  }
};
```

- Проверка пароля происходит с помощью bcrypt.compare.
- При успешной аутентификации возвращается JWT-токен.

## 2. Получение токена и его декодирование

JWT-токен используется для идентификации пользователя при последующих запросах. Токен хранится на клиенте и передаётся в заголовке Authorization.

**Промежуточное ПО для проверки токена:**

```js
// src/utils/checkAuth.js
export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET);

      req.userId = decoded._id;

      next();
    } catch (err) {
      return res.status(403).json({
        message: "Нет доступа",
      });
    }
  } else {
    return res.status(403).json({
      message: "Нет доступа",
    });
  }
}
```

- Токен извлекается из заголовка Authorization.
- Если токен валиден, в объект запроса добавляется userId.
- В случае ошибки возвращается 403.

## Авторизация и доступ к защищённым маршрутам

Для доступа к защищённым маршрутам (например, создание, редактирование, удаление постов) используется промежуточное ПО checkAuth:

```js
// index.js
app.post('/posts', src.checkAuth, ...);
app.patch('/posts/:id', src.checkAuth, ...);
app.delete('/posts/:id', src.checkAuth, ...);
```

- Только авторизованный пользователь может выполнять эти действия.
- Есть ошибка проверки прав на изменение поста (только автор может изменять свой пост).

## Получение информации о текущем пользователе

**Получение данных пользователя по токену:**

```js
// src/controllers/UserController.js
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден"
      })
    }

    const { passwordHash, ...userData } = user._doc;
  
    res.json(userData);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа'
    });
  }
};
```

- ID пользователя берётся из req.userId, который был установлен после декодирования токена.
- Возвращается информация о пользователе без хэша пароля.

---

## Вывод

В проекте реализованы все базовые меры безопасности:

- Пароли пользователей хранятся в зашифрованном виде (bcrypt).
- Для аутентификации используется JWT, который хранит только ID пользователя.
- Для доступа к защищённым маршрутам требуется валидный токен.
- Проверка токена и извлечение ID пользователя реализованы через middleware.
- Данные пользователя возвращаются без хэша пароля.

Это обеспечивает защиту аккаунтов и данных пользователей от несанкционированного доступа.
