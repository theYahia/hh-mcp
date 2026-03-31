#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { searchVacanciesSchema, handleSearchVacancies, getVacancySchema, handleGetVacancy } from "./tools/vacancies.js";
import { getEmployersSchema, handleGetEmployers } from "./tools/employers.js";
import { handleGetAreas, handleGetProfessionalRoles, getSalaryStatsSchema, handleGetSalaryStats } from "./tools/references.js";
import { searchResumesSchema, handleSearchResumes, getResumeSchema, handleGetResume } from "./tools/resumes.js";
import http from "node:http";

function createServer(): McpServer {
  const server = new McpServer({
    name: "hh-mcp",
    version: "1.1.0",
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
    "search_resumes",
    "Поиск резюме на hh.ru (требуется HH_ACCESS_TOKEN).",
    searchResumesSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleSearchResumes(params) }] }),
  );

  server.tool(
    "get_resume",
    "Полная информация о резюме (требуется HH_ACCESS_TOKEN).",
    getResumeSchema.shape,
    async (params) => ({ content: [{ type: "text", text: await handleGetResume(params) }] }),
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

  return server;
}

async function main() {
  const args = process.argv.slice(2);
  const httpMode = args.includes("--http") || !!process.env.HTTP_PORT;
  const port = Number(process.env.HTTP_PORT || process.env.PORT || 3000);

  if (httpMode) {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => crypto.randomUUID() });
    await server.connect(transport);

    const httpServer = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${port}`);

      if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: 8 }));
        return;
      }

      if (url.pathname === "/mcp") {
        await transport.handleRequest(req, res);
        return;
      }

      res.writeHead(404);
      res.end("Not found. Use /mcp for MCP protocol or /health for health check.");
    });

    httpServer.listen(port, () => {
      console.error(`[hh-mcp] HTTP mode on port ${port}. Endpoint: /mcp`);
    });
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("[hh-mcp] Сервер запущен (stdio). 8 инструментов.");
  }
}

export { createServer };

main().catch((error) => {
  console.error("[hh-mcp] Ошибка:", error);
  process.exit(1);
});
