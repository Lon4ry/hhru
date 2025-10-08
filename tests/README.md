# Тестовый контур платформы «СтаффТехнолоджи»

## Структура
- `tests/unit` — unit-тесты утилит, компонентов и клиентских сценариев (Jest + React Testing Library).
- `tests/integration` — интеграционные сценарии для серверных экшенов, авторизации и работы с Prisma.
- `tests/e2e` — сквозные сценарии UI (Playwright).
- `tests/setup` — конфигурация и общие хуки Jest.
- `tests/utils` — вспомогательные утилиты для тестов (сброс базы данных и пр.).

## Запуск
1. Установите зависимости: `pnpm install`
2. Прогон unit-тестов: `pnpm test:unit`
3. Прогон интеграционных тестов: `pnpm test:integration`
4. Сквозные тесты (предварительно запустите `pnpm prisma migrate deploy && pnpm prisma db seed`): `pnpm test:e2e`

Общий прогон всех Jest-проектов: `pnpm test`
