#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { searchVacanciesSchema, handleSearchVacancies, getVacancySchema, handleGetVacancy } from "./tools/vacancies.js";
import { getEmployersSchema, handleGetEmployers } from "./tools/employers.js";
import { handleGetAreas, handleGetProfessionalRoles, getSalaryStatsSchema, handleGetSalaryStats } from "./tools/references.js";

const server = new McpServer({
  name: "hh-mcp",
  version: "1.0.0",
});

server.tool(
  "search_vacancies",
  "Поиск вакансий на hh.ru по ключевым словам, региону, зарплате, опыту.",
  searchVacanciesSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleSearchVacancies(params) }] }),
);

server.tool(
  "get_vacancy",
  "Полная информация о вакансии: описание, требования, навыки, контакты.",
  getVacancySchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetVacancy(params) }] }),
);

server.tool(
  "get_employers",
  "Поиск работодателей по названию.",
  getEmployersSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetEmployers(params) }] }),
);

server.tool(
  "get_salary_stats",
  "Статистика зарплат по специальности и региону.",
  getSalaryStatsSchema.shape,
  async (params) => ({ content: [{ type: "text", text: await handleGetSalaryStats(params) }] }),
);

server.tool(
  "get_areas",
  "Справочник регионов РФ и СНГ с кодами для поиска.",
  {},
  async () => ({ content: [{ type: "text", text: await handleGetAreas() }] }),
);

server.tool(
  "get_professional_roles",
  "Справочник профессиональных ролей для поиска вакансий.",
  {},
  async () => ({ content: [{ type: "text", text: await handleGetProfessionalRoles() }] }),
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[hh-mcp] Сервер запущен. 6 инструментов. Авторизация не требуется для поиска.");
}

main().catch((error) => {
  console.error("[hh-mcp] Ошибка:", error);
  process.exit(1);
});
