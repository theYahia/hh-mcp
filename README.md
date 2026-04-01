# @theyahia/hh-mcp

MCP server for the [hh.ru](https://hh.ru) API — Russia and CIS job market. **16 tools** covering vacancies, resumes, employers, salary statistics, dictionaries, and autocomplete.

[![npm](https://img.shields.io/npm/v/@theyahia/hh-mcp)](https://www.npmjs.com/package/@theyahia/hh-mcp)
[![CI](https://github.com/theYahia/hh-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/theYahia/hh-mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Part of the [Russian API MCP](https://github.com/theYahia/russian-mcp) series by [@theYahia](https://github.com/theYahia).

## Two Modes

| Mode | What's available | Token needed? |
|------|-----------------|:-------------:|
| **No token** | Vacancy search, vacancy by ID, similar vacancies, employers, salary stats, areas, roles, dictionaries, suggests | No |
| **With token** | Everything above + resume search, resume by ID | Yes (`HH_ACCESS_TOKEN`) |

Get a token at [dev.hh.ru/admin](https://dev.hh.ru/admin).

## Installation

### Claude Desktop

```json
{
  "mcpServers": {
    "hh": {
      "command": "npx",
      "args": ["-y", "@theyahia/hh-mcp"],
      "env": {
        "HH_ACCESS_TOKEN": "optional-oauth-token"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add hh -- npx -y @theyahia/hh-mcp
# With token:
claude mcp add hh -e HH_ACCESS_TOKEN=your-token -- npx -y @theyahia/hh-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "hh": {
      "command": "npx",
      "args": ["-y", "@theyahia/hh-mcp"]
    }
  }
}
```

### Windsurf

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

### HTTP Mode (Streamable HTTP)

```bash
npx @theyahia/hh-mcp --http
# or
HTTP_PORT=8080 npx @theyahia/hh-mcp --http
```

Endpoint: `http://localhost:3000/mcp`
Health check: `http://localhost:3000/health`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HH_ACCESS_TOKEN` | No | OAuth 2.0 Bearer token. Required for resume endpoints. |
| `HTTP_PORT` | No | Port for HTTP mode (default: 3000). |

## Tools (16)

### Vacancies

| Tool | Description | Token? |
|------|-------------|:------:|
| `search_vacancies` | Search vacancies by keywords, region, salary, experience, employment type, schedule, with sorting and pagination | No |
| `get_vacancy` | Full vacancy details: description, requirements, key skills, contacts | No |
| `get_similar_vacancies` | Find vacancies similar to a given one | No |

### Resumes

| Tool | Description | Token? |
|------|-------------|:------:|
| `search_resumes` | Search candidate resumes by keywords, region, role, salary, experience | **Yes** |
| `get_resume` | Full resume: experience, education, skills, contacts | **Yes** |

### Employers

| Tool | Description | Token? |
|------|-------------|:------:|
| `search_employers` | Search companies by name and region | No |
| `get_employer` | Employer profile: description, industries, website, vacancy count | No |
| `get_employer_vacancies` | List active vacancies for a specific employer | No |

### Dictionaries & Suggests

| Tool | Description | Token? |
|------|-------------|:------:|
| `get_areas` | Full tree of regions and cities with codes | No |
| `get_professional_roles` | Full tree of professional roles with IDs | No |
| `get_dictionaries` | All reference data: currencies, employment types, schedules, experience levels | No |
| `suggest_positions` | Autocomplete job titles | No |
| `suggest_companies` | Autocomplete company names | No |
| `suggest_areas` | Autocomplete region/city names | No |

### Salary

| Tool | Description | Token? |
|------|-------------|:------:|
| `get_salary_statistics` | Salary distribution for a professional role in a region | No |

## Rate Limiting

Built-in rate limiter respects the hh.ru API limit of 5 requests per second. Automatic retry with exponential backoff on 429 and 5xx errors (up to 3 attempts).

## Demo Prompts

```
Find remote Python developer jobs in Moscow paying over 300,000 RUB
```

```
Show me all open vacancies at Yandex and give me salary statistics for their top roles
```

```
Compare Senior Backend salaries in Moscow vs Saint Petersburg, and suggest similar vacancies to the best-paying one
```

## Development

```bash
git clone https://github.com/theYahia/hh-mcp.git
cd hh-mcp
npm install
npm run build
npm test
```

## API Reference

- [hh.ru API docs](https://api.hh.ru/)
- [hh.ru API GitHub](https://github.com/hhru/api)

## License

MIT
