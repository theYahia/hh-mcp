import { z } from "zod";
import { hhGet } from "../client.js";

export const getSalaryStatisticsSchema = z.object({
  professional_role_id: z
    .number()
    .describe(
      "Professional role ID. Use get_professional_roles or suggest_positions to find IDs.",
    ),
  area_id: z
    .number()
    .optional()
    .describe("Region code (1=Moscow, 2=Saint Petersburg). Use get_areas to find codes."),
});

export async function handleGetSalaryStatistics(
  params: z.infer<typeof getSalaryStatisticsSchema>,
): Promise<string> {
  // The hh.ru salary statistics endpoint requires specific professional_role_id
  // We query the salary database via vacancies with salary aggregation
  const query = new URLSearchParams();
  query.set("professional_role", String(params.professional_role_id));
  if (params.area_id) query.set("area", String(params.area_id));
  query.set("per_page", "0");
  query.set("only_with_salary", "true");

  const result = await hhGet(`/vacancies?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
