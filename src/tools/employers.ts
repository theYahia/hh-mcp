import { z } from "zod";
import { hhGet } from "../client.js";

export const getEmployersSchema = z.object({
  text: z.string().describe("Название компании"),
  area: z.number().optional().describe("Код региона"),
  per_page: z.number().int().min(1).max(100).default(20).describe("Количество"),
});

export async function handleGetEmployers(params: z.infer<typeof getEmployersSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  if (params.area) query.set("area", String(params.area));
  query.set("per_page", String(params.per_page));

  const result = await hhGet(`/employers?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
