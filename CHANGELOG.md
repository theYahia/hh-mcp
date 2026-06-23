# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [2.1.0] - 2026-06-23

### Fixed
- **HTTP mode crashed on Node 18.** `crypto.randomUUID()` was used as a bare
  global (stable only on Node 19+) while `engines`/CI include Node 18. HTTP mode
  is now stateless and no longer references the global.
- **HTTP concurrency bug.** A single shared `StreamableHTTPServerTransport` was
  connected once at startup (a documented anti-pattern that collides across
  concurrent clients). Each request now gets a fresh stateless server+transport.
- **Tool errors now set `isError: true`** so MCP clients/LLMs can distinguish a
  failure from a normal result and self-correct.
- **`get_salary_statistics` was mislabeled** — it advertised "salary
  distribution" but returned only a count. hh.ru has no free distribution
  endpoint, so the tool now samples posted salaries and computes
  median/P25/P75/min/max client-side, clearly labelled as a biased estimate.
- **`search_vacancies` no longer forces `currency=RUR`** on every query — the
  currency is sent only together with a salary filter.
- **Required `HH-User-Agent` header** is now sent (hh.ru requires it; missing it
  risks blocks/captcha). Configurable via `HH_USER_AGENT`.
- Server version, the User-Agent and `/health` are single-sourced from
  `package.json` (was hardcoded and drifting at `2.0.0`).
- Removed a stale, broken duplicate test file referencing a long-gone 8-tool API.
- Test files are no longer compiled into `dist/` / published to npm.

### Added
- **Compact, LLM-friendly output by default** for vacancy/employer/resume search
  and detail tools, with `raw: true` to get the full hh.ru JSON.
- **Expanded `search_vacancies` filters:** `professional_role`, `industry`,
  `metro`, `employer_id`, `period` / `date_from` / `date_to` (mutually
  exclusive), `search_field`, `excluded_text`, `label`, plus modern
  `work_format` / `employment_form` (the legacy `employment`/`schedule` remain
  accepted but are marked deprecated). Pagination depth is capped at 2000.
- **New tools:** `get_industries`, `get_metro`, `get_areas_subtree`, and
  `validate_token` (checks `HH_ACCESS_TOKEN` via `/me` and reports the role).
- Dictionary/suggest tools now return compact `id — name` listings (raw via `raw`).
- HTTP mode: DNS-rebinding protection (allow-lists via `HH_ALLOWED_HOSTS` /
  `HH_ALLOWED_ORIGINS`), binds to `127.0.0.1` by default (`HOST`), `/health`
  reports version, graceful shutdown and a friendly `EADDRINUSE` message.
- ESLint + `lint`/`typecheck` scripts wired into CI; `.env.example`.

### Changed
- Resume tools now fail fast with an actionable message and clarify that they
  require an **employer** token **and a paid resume-database subscription**.
- Bumped `@modelcontextprotocol/sdk` floor to `^1.28.0`.
- Tool count is derived from the registry (now 19 tools) and can no longer drift.

## [2.0.x]
- 16-tool release: vacancies, resumes, employers, salary, dictionaries,
  suggests; rate limiter, retry/backoff, stdio + HTTP transports.
