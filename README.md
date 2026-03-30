# @theyahia/hh-mcp

MCP-сервер для hh.ru API — поиск вакансий, зарплаты, работодатели, справочники. **6 инструментов. Без авторизации.**

[![npm](https://img.shields.io/npm/v/@theyahia/hh-mcp)](https://www.npmjs.com/package/@theyahia/hh-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "hh": {
      "command": "npx",
      "args": ["-y", "@theyahia/hh-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add hh -- npx -y @theyahia/hh-mcp
```

### VS Code / Cursor

```json
{ "servers": { "hh": { "command": "npx", "args": ["-y", "@theyahia/hh-mcp"] } } }
```

### Windsurf

```json
{ "mcpServers": { "hh": { "command": "npx", "args": ["-y", "@theyahia/hh-mcp"] } } }
```

> Авторизация **не нужна** для поиска вакансий. Для доступа к резюме — задайте `HH_ACCESS_TOKEN`.

## Инструменты (6)

| Инструмент | Описание |
|------------|----------|
| `search_vacancies` | Поиск вакансий по словам, региону, зарплате, опыту |
| `get_vacancy` | Полная информация о вакансии с описанием и контактами |
| `get_employers` | Поиск работодателей по названию |
| `get_salary_stats` | Статистика зарплат по специальности и региону |
| `get_areas` | Справочник регионов РФ и СНГ |
| `get_professional_roles` | Справочник профессий |

## Примеры

```
Найди вакансии Python разработчика в Москве от 200000 рублей
Покажи вакансии в Яндексе
Какая средняя зарплата Senior Backend в Петербурге?
```

## Часть серии Russian API MCP

**50 серверов:** [github.com/theYahia/russian-mcp](https://github.com/theYahia/russian-mcp)

## Лицензия

MIT
