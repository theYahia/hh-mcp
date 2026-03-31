# @theyahia/hh-mcp

MCP-сервер для hh.ru: поиск вакансий, резюме, зарплаты, работодатели, справочники. **8 инструментов.**

[![npm](https://img.shields.io/npm/v/@theyahia/hh-mcp)](https://www.npmjs.com/package/@theyahia/hh-mcp)
[![CI](https://github.com/theYahia/hh-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/hh-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Два режима работы

| Режим | Что доступно | Нужен токен? |
|-------|-------------|--------------|
| **Без токена** | Поиск вакансий, вакансия по ID, работодатели, зарплаты, регионы, профроли | Нет |
| **С токеном** | Всё выше + поиск резюме, резюме по ID | Да (`HH_ACCESS_TOKEN`) |

Получить токен: [dev.hh.ru/admin](https://dev.hh.ru/admin)

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "hh": {
      "command": "npx",
      "args": ["-y", "@theyahia/hh-mcp"],
      "env": {
        "HH_ACCESS_TOKEN": "your-token-here (опционально)"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add hh -- npx -y @theyahia/hh-mcp
# С токеном:
claude mcp add hh -e HH_ACCESS_TOKEN=your-token -- npx -y @theyahia/hh-mcp
```

### VS Code / Cursor

```json
{ "servers": { "hh": { "command": "npx", "args": ["-y", "@theyahia/hh-mcp"] } } }
```

### Windsurf

```json
{ "mcpServers": { "hh": { "command": "npx", "args": ["-y", "@theyahia/hh-mcp"] } } }
```

### HTTP режим (Streamable HTTP)

```bash
npx @theyahia/hh-mcp --http
# или
HTTP_PORT=8080 npx @theyahia/hh-mcp --http
```

Эндпоинт: `http://localhost:3000/mcp`
Health check: `http://localhost:3000/health`

## Инструменты (8)

| Инструмент | Описание | Нужен токен? |
|------------|----------|:------------:|
| `search_vacancies` | Поиск вакансий по словам, региону, зарплате, опыту | Нет |
| `get_vacancy` | Полная информация о вакансии с описанием и контактами | Нет |
| `search_resumes` | Поиск резюме по ключевым словам и параметрам | **Да** |
| `get_resume` | Полная информация о резюме | **Да** |
| `get_employers` | Поиск работодателей по названию | Нет |
| `get_salary_stats` | Статистика зарплат по специальности и региону | Нет |
| `get_areas` | Справочник регионов РФ и СНГ с кодами | Нет |
| `get_professional_roles` | Справочник профессиональных ролей | Нет |

## Примеры

```
Найди вакансии Python в Москве от 200К
Покажи вакансии в Яндексе
Средняя зарплата Senior Backend?
Какие регионы есть в hh.ru?
Найди резюме Java-разработчиков в Петербурге
```

## API

Все публичные эндпоинты используют `https://api.hh.ru` без авторизации. Эндпоинты резюме требуют OAuth 2.0 токен через переменную окружения `HH_ACCESS_TOKEN`.

User-Agent: `theYahia-hh-mcp/1.0`

## Разработка

```bash
git clone https://github.com/theYahia/hh-mcp.git
cd hh-mcp
npm install
npm run build
npm test
```

## Часть серии Russian API MCP

**50 серверов:** [github.com/theYahia/russian-mcp](https://github.com/theYahia/russian-mcp)

## Лицензия

MIT
