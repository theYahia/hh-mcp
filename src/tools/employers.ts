import { z } from "zod";
import { hhGet } from "../client.js";

export const searchEmployersSchema = z.object({
  text: z.string().describe("Company name to search for"),
  area: z.number().optional().describe("Region code"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
});

export async function handleSearchEmployers(
  params: z.infer<typeof searchEmployersSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  if (params.area) query.set("area", String(params.area));
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(`/employers?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const getEmployerSchema = z.object({
  employer_id: z.string().describe("Employer ID"),
});

export async function handleGetEmployer(
  params: z.infer<typeof getEmployerSchema>,
): Promise<string> {
  const result = await hhGet(`/employers/${params.employer_id}`);
  return JSON.stringify(result, null, 2);
}

export const getEmployerVacanciesSchema = z.object({
  employer_id: z.string().describe("Employer ID"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
});

export async function handleGetEmployerVacancies(
  params: z.infer<typeof getEmployerVacanciesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(
    `/employers/${params.employer_id}/vacancies/active?${query.toString()}`,
  );
  return JSON.stringify(result, null, 2);
}
