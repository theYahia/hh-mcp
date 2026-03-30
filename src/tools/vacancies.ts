import { z } from "zod";
import { hhGet } from "../client.js";

export const searchVacanciesSchema = z.object({
  text: z.string().optional().describe("Ключевые слова для поиска"),
  area: z.number().optional().describe("Код региона (1=Москва, 2=СПб)"),
  salary: z.number().optional().describe("Желаемая зарплата"),
  currency: z.string().default("RUR").describe("Валюта зарплаты"),
  experience: z.enum(["noExperience", "between1And3", "between3And6", "moreThan6"]).optional().describe("Опыт работы"),
  employment: z.enum(["full", "part", "project", "volunteer", "probation"]).optional().describe("Тип занятости"),
  per_page: z.number().int().min(1).max(100).default(20).describe("Количество на странице"),
});

export async function handleSearchVacancies(params: z.infer<typeof searchVacanciesSchema>): Promise<string> {
  const query = new URLSearchParams();
  if (params.text) query.set("text", params.text);
  if (params.area) query.set("area", String(params.area));
  if (params.salary) query.set("salary", String(params.salary));
  if (params.currency) query.set("currency", params.currency);
  if (params.experience) query.set("experience", params.experience);
  if (params.employment) query.set("employment", params.employment);
  query.set("per_page", String(params.per_page));

  const result = await hhGet(`/vacancies?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const getVacancySchema = z.object({
  id: z.string().describe("ID вакансии"),
});

export async function handleGetVacancy(params: z.infer<typeof getVacancySchema>): Promise<string> {
  const result = await hhGet(`/vacancies/${params.id}`);
  return JSON.stringify(result, null, 2);
}
