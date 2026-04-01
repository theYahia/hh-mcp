#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  searchVacanciesSchema,
  handleSearchVacancies,
  getVacancySchema,
  handleGetVacancy,
  getSimilarVacanciesSchema,
  handleGetSimilarVacancies,
} from "./tools/vacancies.js";
import {
  searchEmployersSchema,
  handleSearchEmployers,
  getEmployerSchema,
  handleGetEmployer,
  getEmployerVacanciesSchema,
  handleGetEmployerVacancies,
} from "./tools/employers.js";
import {
  searchResumesSchema,
  handleSearchResumes,
  getResumeSchema,
  handleGetResume,
} from "./tools/resumes.js";
import {
  handleGetAreas,
  handleGetProfessionalRoles,
  handleGetDictionaries,
  suggestPositionsSchema,
  handleSuggestPositions,
  suggestCompaniesSchema,
  handleSuggestCompanies,
  suggestAreasSchema,
  handleSuggestAreas,
} from "./tools/references.js";
import {
  getSalaryStatisticsSchema,
  handleGetSalaryStatistics,
} from "./tools/salary.js";
import { HhApiError } from "./client.js";
import http from "node:http";

const TOOL_COUNT = 16;

function wrapHandler(
  fn: (params: any) => Promise<string>,
): (params: any) => Promise<{ content: { type: "text"; text: string }[] }> {
  return async (params) => {
    try {
      const text = await fn(params);
      return { content: [{ type: "text" as const, text }] };
    } catch (error) {
      const message =
        error instanceof HhApiError
          ? `Error ${error.status}: ${error.message}${error.body ? `\n${error.body}` : ""}`
          : error instanceof Error
            ? error.message
            : String(error);
      return { content: [{ type: "text" as const, text: `ERROR: ${message}` }] };
    }
  };
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "hh-mcp",
    version: "2.0.0",
  });

  // --- Vacancies (3) ---

  server.tool(
    "search_vacancies",
    "Search job vacancies on hh.ru by keywords, region, salary, experience, employment type, schedule. Returns paginated list with title, salary, employer, snippet.",
    searchVacanciesSchema.shape,
    wrapHandler(handleSearchVacancies),
  );

  server.tool(
    "get_vacancy",
    "Get full vacancy details: description, requirements, key skills, contacts, employer info.",
    getVacancySchema.shape,
    wrapHandler(handleGetVacancy),
  );

  server.tool(
    "get_similar_vacancies",
    "Find vacancies similar to a given one. Useful for expanding a candidate's job search.",
    getSimilarVacanciesSchema.shape,
    wrapHandler(handleGetSimilarVacancies),
  );

  // --- Resumes (2) — require employer token ---

  server.tool(
    "search_resumes",
    "Search candidate resumes by keywords, region, professional role, salary, experience. Requires employer OAuth token (HH_ACCESS_TOKEN).",
    searchResumesSchema.shape,
    wrapHandler(handleSearchResumes),
  );

  server.tool(
    "get_resume",
    "Get full resume details: experience, education, skills, contacts. Requires employer OAuth token (HH_ACCESS_TOKEN).",
    getResumeSchema.shape,
    wrapHandler(handleGetResume),
  );

  // --- Employers (3) ---

  server.tool(
    "search_employers",
    "Search companies/employers on hh.ru by name. Returns company info and open vacancy count.",
    searchEmployersSchema.shape,
    wrapHandler(handleSearchEmployers),
  );

  server.tool(
    "get_employer",
    "Get detailed employer profile: description, industries, website, vacancy count.",
    getEmployerSchema.shape,
    wrapHandler(handleGetEmployer),
  );

  server.tool(
    "get_employer_vacancies",
    "List active vacancies for a specific employer.",
    getEmployerVacanciesSchema.shape,
    wrapHandler(handleGetEmployerVacancies),
  );

  // --- Dictionaries & Suggests (6) ---

  server.tool(
    "get_areas",
    "Get the full tree of regions and cities with their codes. Use to find area IDs for search filters.",
    {},
    wrapHandler(handleGetAreas),
  );

  server.tool(
    "get_professional_roles",
    "Get the full tree of professional roles with IDs. Use to find role IDs for resume search and salary stats.",
    {},
    wrapHandler(handleGetProfessionalRoles),
  );

  server.tool(
    "get_dictionaries",
    "Get all reference dictionaries: currencies, employment types, schedules, experience levels, vacancy types, and more.",
    {},
    wrapHandler(handleGetDictionaries),
  );

  server.tool(
    "suggest_positions",
    "Autocomplete job titles / professional roles. Returns matching role suggestions for partial input.",
    suggestPositionsSchema.shape,
    wrapHandler(handleSuggestPositions),
  );

  server.tool(
    "suggest_companies",
    "Autocomplete company names. Returns matching employer suggestions for partial input.",
    suggestCompaniesSchema.shape,
    wrapHandler(handleSuggestCompanies),
  );

  server.tool(
    "suggest_areas",
    "Autocomplete region/city names. Returns matching area suggestions for partial input.",
    suggestAreasSchema.shape,
    wrapHandler(handleSuggestAreas),
  );

  // --- Salary (1) ---

  server.tool(
    "get_salary_statistics",
    "Get salary statistics for a professional role in a region. Returns vacancy count and salary distribution data.",
    getSalaryStatisticsSchema.shape,
    wrapHandler(handleGetSalaryStatistics),
  );

  return server;
}

// --- Start ---

async function main() {
  const args = process.argv.slice(2);
  const httpMode = args.includes("--http") || !!process.env.HTTP_PORT;
  const port = Number(process.env.HTTP_PORT || process.env.PORT || 3000);

  if (httpMode) {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });
    await server.connect(transport);

    const httpServer = http.createServer(async (req, res) => {
      const url = new URL(req.url || "/", `http://localhost:${port}`);

      if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", tools: TOOL_COUNT }));
        return;
      }

      if (url.pathname === "/mcp") {
        await transport.handleRequest(req, res);
        return;
      }

      res.writeHead(404);
      res.end(
        "Not found. Use /mcp for MCP protocol or /health for health check.",
      );
    });

    httpServer.listen(port, () => {
      console.error(`[hh-mcp] HTTP mode on port ${port}. Endpoint: /mcp`);
    });
  } else {
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(
      `[hh-mcp] Server started (stdio). ${TOOL_COUNT} tools. Auth: ${process.env.HH_ACCESS_TOKEN ? "token set" : "no token (public endpoints only)"}`,
    );
  }
}

main().catch((error) => {
  console.error("[hh-mcp] Fatal error:", error);
  process.exit(1);
});
