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

### Frontend (`/web`)
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Tooling**: [Biome](https://biomejs.dev/) (Linting & Formatting)

### Backend (`/backend`)
- **CMS**: [Strapi 5](https://strapi.io/) (Headless CMS)
- **Database**: PostgreSQL
- **Language**: TypeScript

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Server**: Nginx / Caddy (в продакшене)

## 🏁 Начало работы

### Предварительные требования

- [Node.js](https://nodejs.org/) (версия 18 или выше)
- [Docker](https://www.docker.com/) и Docker Compose

### 🐳 Запуск с помощью Docker (Рекомендуется)

Этот метод автоматически поднимает базу данных, бэкенд и фронтенд.

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd questly
   ```

2. **Настройте переменные окружения:**
   Создайте файл `.env` в корне проекта, используя пример:
   ```bash
   cp .env.production.example .env
   ```
   > **Важно:** Обязательно сгенерируйте новые секретные ключи (JWT_SECRET, API_KEYS и т.д.) для безопасности.

3. **Запустите проект:**
   ```bash
   docker-compose up --build
   ```

После запуска сервисы будут доступны по следующим адресам:
- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Strapi Admin Panel**: [http://localhost:1337/admin](http://localhost:1337/admin)
- **API**: [http://localhost:1337/api](http://localhost:1337/api)

### 💻 Локальный запуск (для разработки)

Если вы хотите запустить сервисы по отдельности без Docker (потребуется локальный PostgreSQL).

#### 1. Backend (Strapi)

```bash
cd backend
npm install
# Убедитесь, что у вас настроен .env с доступом к локальной БД
npm run develop
```

#### 2. Frontend (Next.js)

```bash
cd web
npm install
# Убедитесь, что переменные окружения настроены корректно
npm run dev
```

## 📂 Структура проекта

```
questly/
├── backend/            # Исходный код Strapi (CMS & API)
│   ├── config/         # Конфигурация Strapi
│   ├── src/            # API, контент-типы, плагины
│   └── public/         # Загруженные файлы (uploads)
├── web/                # Исходный код Next.js (Frontend)
│   ├── app/            # Страницы и роутинг (App Router)
│   ├── components/     # React компоненты
│   └── lib/            # Утилиты и хуки
├── docker-compose.yml  # Оркестрация контейнеров
└── .env.production.example # Пример переменных окружения
```

## 🤝 Вклад в проект

1. Форкните репозиторий.
2. Создайте ветку для новой фичи (`git checkout -b feature/amazing-feature`).
3. Закоммитьте изменения (`git commit -m 'Add some amazing feature'`).
4. Запушьте ветку (`git push origin feature/amazing-feature`).
5. Откройте Pull Request.

---
🤖 Note: this project was developed in collaboration with artificial intelligence
