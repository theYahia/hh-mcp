import { z } from "zod";
import { hhGet } from "../client.js";

export const searchResumesSchema = z.object({
  text: z.string().optional().describe("Ключевые слова для поиска резюме"),
  area: z.number().optional().describe("Код региона (1=Москва, 2=СПб)"),
  professional_role: z.number().optional().describe("Код профессиональной роли"),
  experience: z.enum(["noExperience", "between1And3", "between3And6", "moreThan6"]).optional().describe("Опыт работы"),
  per_page: z.number().int().min(1).max(100).default(20).describe("Количество на странице"),
});

export async function handleSearchResumes(params: z.infer<typeof searchResumesSchema>): Promise<string> {
  const token = process.env.HH_ACCESS_TOKEN;
  if (!token) {
    return JSON.stringify({
      error: "Требуется авторизация. Задайте HH_ACCESS_TOKEN для доступа к резюме.",
      hint: "Получите токен на https://dev.hh.ru/admin",
    });
  }

  const query = new URLSearchParams();
  if (params.text) query.set("text", params.text);
  if (params.area) query.set("area", String(params.area));
  if (params.professional_role) query.set("professional_role", String(params.professional_role));
  if (params.experience) query.set("experience", params.experience);
  query.set("per_page", String(params.per_page));

  const result = await hhGet(`/resumes?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const getResumeSchema = z.object({
  id: z.string().describe("ID резюме"),
});

export async function handleGetResume(params: z.infer<typeof getResumeSchema>): Promise<string> {
  const token = process.env.HH_ACCESS_TOKEN;
  if (!token) {
    return JSON.stringify({
      error: "Требуется авторизация. Задайте HH_ACCESS_TOKEN для доступа к резюме.",
      hint: "Получите токен на https://dev.hh.ru/admin",
    });
  }

  const result = await hhGet(`/resumes/${params.id}`);
  return JSON.stringify(result, null, 2);
}
