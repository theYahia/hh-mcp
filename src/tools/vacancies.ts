import { z } from "zod";
import { hhGet } from "../client.js";

export const searchVacanciesSchema = z.object({
  text: z.string().optional().describe("Search keywords (job title, skills, company name)"),
  area: z
    .number()
    .optional()
    .describe("Region code (1=Moscow, 2=Saint Petersburg). Use get_areas to find codes."),
  salary: z.number().optional().describe("Desired salary amount"),
  currency: z.string().default("RUR").describe("Salary currency (RUR, USD, EUR)"),
  experience: z
    .enum(["noExperience", "between1And3", "between3And6", "moreThan6"])
    .optional()
    .describe("Required experience level"),
  employment: z
    .enum(["full", "part", "project", "volunteer", "probation"])
    .optional()
    .describe("Employment type"),
  schedule: z
    .enum(["fullDay", "shift", "flexible", "remote", "flyInFlyOut"])
    .optional()
    .describe("Work schedule"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Results per page (1-100)"),
  page: z
    .number()
    .int()
    .min(0)
    .default(0)
    .describe("Page number (0-based)"),
  order_by: z
    .enum(["relevance", "publication_time", "salary_desc", "salary_asc"])
    .optional()
    .describe("Sort order"),
});

export async function handleSearchVacancies(
  params: z.infer<typeof searchVacanciesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  if (params.text) query.set("text", params.text);
  if (params.area) query.set("area", String(params.area));
  if (params.salary) query.set("salary", String(params.salary));
  if (params.currency) query.set("currency", params.currency);
  if (params.experience) query.set("experience", params.experience);
  if (params.employment) query.set("employment", params.employment);
  if (params.schedule) query.set("schedule", params.schedule);
  if (params.order_by) query.set("order_by", params.order_by);
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(`/vacancies?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const getVacancySchema = z.object({
  vacancy_id: z.string().describe("Vacancy ID"),
});

export async function handleGetVacancy(
  params: z.infer<typeof getVacancySchema>,
): Promise<string> {
  const result = await hhGet(`/vacancies/${params.vacancy_id}`);
  return JSON.stringify(result, null, 2);
}

export const getSimilarVacanciesSchema = z.object({
  vacancy_id: z.string().describe("Vacancy ID to find similar vacancies for"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
});

export async function handleGetSimilarVacancies(
  params: z.infer<typeof getSimilarVacanciesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(
    `/vacancies/${params.vacancy_id}/similar_vacancies?${query.toString()}`,
  );
  return JSON.stringify(result, null, 2);
}
