# API Документация Express-JS-Pet

> Документирует API взамен пользовательской документации, так как текущее приложение не имеет пользовательского интерфейса.

## Оглавление
1. [Введение](#введение)
2. [Аутентификация и авторизация](#аутентификация-и-авторизация)
3. [Схемы данных](#схемы-данных)
4. [Эндпоинты API](#эндпоинты-api)
    - [Пользователь](#пользователь)
    - [Посты](#посты)
    - [Файлы](#файлы)
5. [Коды ошибок](#коды-ошибок)
6. [Примеры запросов](#примеры-запросов)
7. [FAQ](#faq)

---

## Введение

**Express-JS-Pet** — RESTful API на Node.js (Express) c функционалом для регистрации, авторизации, управления постами и загрузки файлов. Использует MongoDB для хранения данных, JWT для авторизации, Multer для загрузки файлов.

- **База данных:** MongoDB
- **Язык:** JavaScript (Node.js, Express)
- **Аутентификация:** JWT
- **Загрузка файлов:** Multer

## Аутентификация и авторизация

- Для доступа к защищённым эндпоинтам требуется JWT-токен.
- Токен возвращается при регистрации/логине и передаётся в заголовке:

```text
Authorization: Bearer <ваш_токен>
```

## Схемы данных

### User

```json
{
    "_id": "string",
    "email": "string",
    "passwordHash": "string",
    "createdAt": "date",
    "updatedAt": "date"
}
```

### Post

```json
{
    "_id": "string",
    "title": "string",
    "text": "string",
    "user": "User",
    "createdAt": "date",
    "updatedAt": "date"
}
```

## Эндпоинты API

### Пользователь

#### Регистрация

- **POST** `/auth/register`
- **Описание:** Регистрация нового пользователя
- **Тело запроса:**

```json
{
    "email": "user@example.com",
    "password": "string"
}
```

- **Ответ:**

```json
{
    "token": "jwt_token",
    "user": { "_id": "...", "email": "..." }
}
```

#### Вход

- **POST** `/auth/login`
- **Описание:** Аутентификация пользователя
- **Тело запроса:**

```json
{
    "email": "user@example.com",
    "password": "string"
}
```

- **Ответ:**

```json
{
    "token": "jwt_token",
    "user": { "_id": "...", "email": "..." }
}
```

#### Получить профиль

- **GET** `/auth/me`
- **Описание:** Получить данные текущего пользователя
- **Заголовки:**
  - `Authorization: Bearer <jwt_token>`
- **Ответ:**

```json
{
    "_id": "...",
    "email": "..."
}
```

---

### Посты

#### Получить все посты

- **GET** `/posts`
- **Описание:** Получить список всех постов
- **Ответ:**

```json
[
    {
        "_id": "...",
        "title": "...",
        "text": "...",
        "user": { "_id": "...", "email": "..." },
        "createdAt": "..."
    },
    ...
]
```

#### Получить пост по ID

- **GET** `/posts/:id`
- **Описание:** Получить один пост по идентификатору
- **Ответ:**

```json
{
    "_id": "...",
    "title": "...",
    "text": "...",
    "user": { "_id": "...", "email": "..." },
    "createdAt": "..."
}
```

#### Создать пост

- **POST** `/posts`
- **Описание:** Создать новый пост
- **Заголовки:**
  - `Authorization: Bearer <jwt_token>`
- **Тело запроса:**

```json
{
    "title": "string",
    "text": "string"
}
```

- **Ответ:**

```json
{
    "_id": "...",
    "title": "...",
    "text": "...",
    "user": { "_id": "...", "email": "..." },
    "createdAt": "..."
}
```

#### Обновить пост

- **PATCH** `/posts/:id`
- **Описание:** Обновить существующий пост
- **Заголовки:**
  - `Authorization: Bearer <jwt_token>`
- **Тело запроса:**

```json
{
    "title": "string (optional)",
    "text": "string (optional)"
}
```

- **Ответ:**

```json
{
    "_id": "...",
    "title": "...",
    "text": "...",
    "user": { "_id": "...", "email": "..." },
    "createdAt": "..."
}
```

#### Удалить пост

- **DELETE** `/posts/:id`
- **Описание:** Удалить пост по идентификатору
- **Заголовки:**
  - `Authorization: Bearer <jwt_token>`
- **Ответ:**

```json
{ "success": true }
```

---

### Файлы

#### Загрузка файла

- **POST** `/upload`
- **Описание:** Загрузка изображения (только для авторизованных пользователей)
- **Заголовки:**
  - `Authorization: Bearer <jwt_token>`
- **Форма:** поле `image` (тип — файл)
- **Ответ:**

```json
{ "url": "/uploads/filename.jpg" }
```

#### Доступ к файлам

- **GET** `/uploads/:filename`
- **Описание:** Получить загруженный файл по имени

---

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Некорректный запрос (валидация, отсутствуют поля) |
| 401 | Неавторизован (нет токена или токен невалиден) |
| 403 | Нет доступа |
| 404 | Не найдено (пост, пользователь и т.д.) |
| 500 | Внутренняя ошибка сервера |

---

## Примеры запросов

### Регистрация пользователя

```javascript
// Регистрация нового пользователя
async function registerUser() {
  const url = 'http://localhost:4444/auth/register';
  const userData = {
    email: 'user@example.com',
    password: '123456',
    fullName: 'Имя'
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Ошибка регистрации');
    console.log('Успешная регистрация:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при регистрации:', error.message);
    throw error;
  }
}
// registerUser();
```

---

### Вход в систему

```javascript
// Вход пользователя
async function loginUser() {
  const url = 'http://localhost:4444/auth/login';
  const userData = {
    email: 'user@example.com',
    password: '123456'
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Ошибка входа');
    console.log('Успешный вход:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при входе:', error.message);
    throw error;
  }
}
// loginUser();
```

---

### Получить все посты

```javascript
// Получить список всех постов
async function getAllPosts() {
  const url = 'http://localhost:4444/posts';
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Ошибка получения постов');
    console.log('Посты:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при получении постов:', error.message);
    throw error;
  }
}
// getAllPosts();
```

---

### Создать пост

```javascript
// Создать новый пост (требуется JWT-токен)
async function createPost(token) {
  const url = 'http://localhost:4444/posts';
  const postData = {
    title: 'Заголовок',
    text: 'Текст поста'
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(postData)
  };
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Ошибка создания поста');
    console.log('Пост создан:', data);
    return data;
  } catch (error) {
    console.error('Ошибка при создании поста:', error.message);
    throw error;
  }
}
// createPost('<jwt_token>');
```

---

## FAQ

**Q:** Как получить JWT-токен?  
**A:** Зарегистрируйтесь или войдите через `/auth/register` или `/auth/login`.

**Q:** Как загрузить изображение?  
**A:** Используйте эндпоинт `/upload` с авторизацией и файлом в поле `image`.

**Q:** Как получить свои данные?  
**A:** Отправьте GET-запрос на `/auth/me` с JWT-токеном.