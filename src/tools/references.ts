import { z } from "zod";
import { hhGet } from "../client.js";

// --- Areas ---

export async function handleGetAreas(): Promise<string> {
  const result = await hhGet("/areas");
  return JSON.stringify(result, null, 2);
}

// --- Professional Roles ---

export async function handleGetProfessionalRoles(): Promise<string> {
  const result = await hhGet("/professional_roles");
  return JSON.stringify(result, null, 2);
}

// --- Dictionaries ---

export async function handleGetDictionaries(): Promise<string> {
  const result = await hhGet("/dictionaries");
  return JSON.stringify(result, null, 2);
}

// --- Suggests ---

export const suggestPositionsSchema = z.object({
  text: z.string().describe("Partial job title to autocomplete"),
});

export async function handleSuggestPositions(
  params: z.infer<typeof suggestPositionsSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  const result = await hhGet(`/suggests/professional_roles?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const suggestCompaniesSchema = z.object({
  text: z.string().describe("Partial company name to autocomplete"),
});

export async function handleSuggestCompanies(
  params: z.infer<typeof suggestCompaniesSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  const result = await hhGet(`/suggests/companies?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}

export const suggestAreasSchema = z.object({
  text: z.string().describe("Partial region/city name to autocomplete"),
});

export async function handleSuggestAreas(
  params: z.infer<typeof suggestAreasSchema>,
): Promise<string> {
  const query = new URLSearchParams();
  query.set("text", params.text);
  const result = await hhGet(`/suggests/areas?${query.toString()}`);
  return JSON.stringify(result, null, 2);
}
