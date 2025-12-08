# Questly 🎲

**Questly** — это интерактивное приложение для генерации ежедневных заданий, призванное добавить разнообразие, спонтанность и игровые элементы в повседневную жизнь.

## 🚀 Функционал

- 🎲 **Генерация квестов**: Получайте случайные задания на каждый день, чтобы выйти из зоны комфорта.
- 📂 **Разнообразные категории**: Спорт, творчество, социальные взаимодействия, саморазвитие, домашние дела и многое другое.
- 📊 **Уровни сложности**: Выбирайте уровень под свое настроение — от легкого (Easy) до сложного (Hard).
- 👤 **Профиль пользователя**: Регистрация, авторизация и отслеживание прогресса.
- 💬 **Сообщество**: Публикуйте отчеты о выполненных квестах, делитесь впечатлениями и комментируйте достижения других пользователей.

## 🛠️ Технологии

Проект построен на современном стеке технологий, обеспечивающем производительность и масштабируемость.

### Приложение
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router + server actions/API routes)
- **Language**: TypeScript
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Data Layer**: [Drizzle ORM](https://orm.drizzle.team/)
- **Tooling**: [Biome](https://biomejs.dev/) для форматирования и линтинга

### Данные и инфраструктура
- **Database**: SQLite (файл `dev.db`) в разработке, PostgreSQL 15+ в продакшене
- **Migrations**: drizzle-kit (`npm run db:push`, задайте `DRIZZLE_DIALECT=postgres` для генерации продовых миграций)
- **Containerization**: Docker (multi-stage image) + Docker Compose/any orchestrator
- **Reverse proxy**: Nginx / Caddy на проде (по желанию)

## 🏁 Начало работы

### Предварительные требования

- [Node.js](https://nodejs.org/) 18+
- Локальный экземпляр PostgreSQL 15+ (можно через Docker)
- [Docker](https://www.docker.com/) / Docker Compose — для развёртывания и удобного запуска

### 🐳 Запуск с помощью Docker

1. **Клонируйте репозиторий и настройте `.env`:**
   ```bash
   git clone <repository-url>
   cd questly
   cp .env.example .env
   ```
   Обновите `DATABASE_URL`, `AUTH_SECRET` и админские креды. Значения `POSTGRES_*` используются docker-compose для базы данных.

2. **Поднимите базу данных (можно отдельно):**
   ```bash
   docker compose up -d postgres
   ```

3. **Примените миграции Drizzle (PostgreSQL):**
   ```bash
   DRIZZLE_DIALECT=postgres DATABASE_URL=postgres://questly:questly@localhost:5432/questly npm run db:push
   ```
   Используйте свой DSN, если вы поменяли логин/пароль.

4. **Соберите и запустите приложение:**
   ```bash
   docker compose up --build web
   ```
   Next.js будет доступен по адресу [http://localhost:3000](http://localhost:3000).

> ⚙️ В production схеме рекомендуется запускать `npm run db:push` в CI/CD перед деплоем контейнера, чтобы структура БД всегда была синхронизирована.

> 💡 Чтобы принудительно использовать PostgreSQL в любом окружении (например, в dev), задайте `DATABASE_DIALECT=postgres` и укажите `DATABASE_URL`/`POSTGRES_URL` с подключением к серверу.

### 💻 Локальный запуск (без Docker для приложения)

1. Установите зависимости:
   ```bash
   npm install
   ```
2. По умолчанию `DATABASE_URL="file:./dev.db"` — SQLite создастся автоматически. Если хотите протестировать с PostgreSQL, запустите контейнер и задайте `DRIZZLE_DIALECT=postgres`.
3. Обновите схему в локальной базе:
   ```bash
   npm run db:push
   ```
4. Стартуйте dev-сервер:
   ```bash
   npm run dev
   ```
   Приложение поднимется на [http://localhost:3000](http://localhost:3000).

## 📂 Структура проекта

```
questly/
├── app/                # Маршруты, API-роуты и server components
├── components/         # UI и бизнес-компоненты
├── db/                 # Схема Drizzle (TypeScript)
├── drizzle/            # Сгенерированные SQL-миграции
├── lib/                # Утилиты (auth, db, helpers)
├── public/             # Статические ассеты и загрузки
├── backend_legacy/     # Старый Strapi-бэкенд (оставлен для истории)
├── docker-compose.yml  # Оркестрация Next + PostgreSQL
└── .env.example        # Базовый шаблон переменных окружения
```

## 🔐 Админская учётная запись

- Задайте переменные `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_EMAIL` и `DEFAULT_ADMIN_PASSWORD` (а также `AUTH_SECRET`) в `.env` — по ним будет создан первый администратор.
- При первом обращении к `/api/auth/local` (страница входа) сервер проверит наличие админа и при необходимости создаст или повысит пользователя с указанным email.
- JWT теперь дополнительно сохраняется в HTTP-only cookie, поэтому доступ к `/admin` проверяется на стороне сервера без участия клиента.
- Любой запрос к `/admin` автоматически перенаправляется на `/login`, если токен отсутствует, истёк или пользователь не является администратором.

### Панель управления

- `/admin/quests` — база квестов с созданием, редактированием текста, сложности, категории и веса.
- `/admin/cards` — карточки пользователей. Их нельзя создать вручную, но можно поправить текст, сложность, категорию и seed.
- `/admin/posts` — полный CRUD по постам: привязка автора, карточки, текста и статуса видимости.
- `/admin/users` — создание, изменение профилей и выдача админских прав, сброс пароля.
- `/admin/media` — просмотр загруженных файлов из `public/uploads` и удаление лишних ресурсов.
- `/admin/feedbacks` — входящие сообщения обратной связи с возможностью менять статус.

## 🤝 Вклад в проект

1. Форкните репозиторий.
2. Создайте ветку для новой фичи (`git checkout -b feature/amazing-feature`).
3. Закоммитьте изменения (`git commit -m 'Add some amazing feature'`).
4. Запушьте ветку (`git push origin feature/amazing-feature`).
5. Откройте Pull Request.

---
🤖 Примечание: этот проект был разработан при использовании искусственного интеллекта.
