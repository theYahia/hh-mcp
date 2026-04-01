import { z } from "zod";
import { hhGet } from "../client.js";

export const searchResumesSchema = z.object({
  text: z
    .string()
    .optional()
    .describe("Search keywords (skills, job title, etc.)"),
  area: z
    .number()
    .optional()
    .describe("Region code (1=Moscow, 2=Saint Petersburg)"),
  professional_role: z
    .number()
    .optional()
    .describe(
      "Professional role ID. Use get_professional_roles to find IDs.",
    ),
  salary: z.number().optional().describe("Expected salary amount"),
  experience: z
    .enum(["noExperience", "between1And3", "between3And6", "moreThan6"])
    .optional()
    .describe("Experience level"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Results per page"),
  page: z.number().int().min(0).default(0).describe("Page number (0-based)"),
});

export async function handleSearchResumes(
  params: z.infer<typeof searchResumesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  if (params.text) query.set("text", params.text);
  if (params.area) query.set("area", String(params.area));
  if (params.professional_role)
    query.set("professional_role", String(params.professional_role));
  if (params.salary) query.set("salary", String(params.salary));
  if (params.experience) query.set("experience", params.experience);
  query.set("per_page", String(params.per_page));
  query.set("page", String(params.page));

  const result = await hhGet(`/resumes?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const getResumeSchema = z.object({
  resume_id: z.string().describe("Resume ID"),
});

export async function handleGetResume(
  params: z.infer<typeof getResumeSchema>,
): Promise<string> {
  const result = await hhGet(`/resumes/${params.resume_id}`);
  return JSON.stringify(result, null, 2);
}
