import { z } from "zod";
import { hhGet } from "../client.js";

export async function handleGetAreas(): Promise<string> {
  const result = await hhGet("/areas");
  return JSON.stringify(result, null, 2);
}

export async function handleGetProfessionalRoles(): Promise<string> {
  const result = await hhGet("/professional_roles");
  return JSON.stringify(result, null, 2);
}

export const getSalaryStatsSchema = z.object({
  text: z.string().describe("Название специальности"),
  area: z.number().optional().describe("Код региона (1=Москва)"),
});

export async function handleGetSalaryStats(params: z.infer<typeof getSalaryStatsSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  if (params.area) query.set("area", String(params.area));

  // hh.ru salary stats through vacancy search aggregation
  query.set("per_page", "0");
  query.set("only_with_salary", "true");

  const result = await hhGet(`/vacancies?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
