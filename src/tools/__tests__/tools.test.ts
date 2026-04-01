import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the client module before importing tools
vi.mock("../../client.js", () => ({
  hhGet: vi.fn(),
  HhApiError: class HhApiError extends Error {
    status: number;
    statusText: string;
    body?: string;
    constructor(status: number, statusText: string, body?: string) {
      super(`hh.ru HTTP ${status}: ${statusText}`);
      this.name = "HhApiError";
      this.status = status;
      this.statusText = statusText;
      this.body = body;
    }
  },
}));

import { hhGet } from "../../client.js";
import { handleSearchVacancies, handleGetVacancy, handleGetSimilarVacancies } from "../vacancies.js";
import { handleSearchEmployers, handleGetEmployer, handleGetEmployerVacancies } from "../employers.js";
import { handleSearchResumes, handleGetResume } from "../resumes.js";
import {
  handleGetAreas,
  handleGetProfessionalRoles,
  handleGetDictionaries,
  handleSuggestPositions,
  handleSuggestCompanies,
  handleSuggestAreas,
} from "../references.js";
import { handleGetSalaryStatistics } from "../salary.js";

const mockHhGet = vi.mocked(hhGet);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("search_vacancies", () => {
  it("builds correct query params and returns JSON", async () => {
    const mockResponse = {
      items: [{ id: "123", name: "Developer" }],
      found: 1,
      pages: 1,
      per_page: 20,
      page: 0,
    };
    mockHhGet.mockResolvedValueOnce(mockResponse);

    const result = await handleSearchVacancies({
      text: "python",
      area: 1,
      salary: 200000,
      currency: "RUR",
      experience: "between1And3",
      per_page: 20,
      page: 0,
    });

    expect(mockHhGet).toHaveBeenCalledOnce();
    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/vacancies?");
    expect(callUrl).toContain("text=python");
    expect(callUrl).toContain("area=1");
    expect(callUrl).toContain("salary=200000");
    expect(callUrl).toContain("experience=between1And3");

    const parsed = JSON.parse(result);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].name).toBe("Developer");
  });

  it("omits optional params when not provided", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [], found: 0, pages: 0, per_page: 20, page: 0 });

    await handleSearchVacancies({ currency: "RUR", per_page: 20, page: 0 });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).not.toContain("text=");
    expect(callUrl).not.toContain("area=");
    expect(callUrl).toContain("per_page=20");
  });
});

describe("get_vacancy", () => {
  it("fetches vacancy by ID", async () => {
    const mockVacancy = { id: "456", name: "Senior Dev", description: "Good job" };
    mockHhGet.mockResolvedValueOnce(mockVacancy);

    const result = await handleGetVacancy({ vacancy_id: "456" });

    expect(mockHhGet).toHaveBeenCalledWith("/vacancies/456");
    const parsed = JSON.parse(result);
    expect(parsed.id).toBe("456");
  });
});

describe("get_similar_vacancies", () => {
  it("fetches similar vacancies with pagination", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [{ id: "789" }], found: 1 });

    const result = await handleGetSimilarVacancies({
      vacancy_id: "456",
      per_page: 10,
      page: 0,
    });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/vacancies/456/similar_vacancies");
    expect(callUrl).toContain("per_page=10");
    expect(JSON.parse(result).items[0].id).toBe("789");
  });
});

describe("employers", () => {
  it("search_employers builds query correctly", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [{ id: "1", name: "Yandex" }] });

    await handleSearchEmployers({ text: "Yandex", per_page: 20, page: 0 });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/employers?");
    expect(callUrl).toContain("text=Yandex");
  });

  it("get_employer fetches by ID", async () => {
    mockHhGet.mockResolvedValueOnce({ id: "1740", name: "Yandex" });

    const result = await handleGetEmployer({ employer_id: "1740" });

    expect(mockHhGet).toHaveBeenCalledWith("/employers/1740");
    expect(JSON.parse(result).name).toBe("Yandex");
  });

  it("get_employer_vacancies lists active vacancies", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [{ id: "v1" }], found: 1 });

    await handleGetEmployerVacancies({ employer_id: "1740", per_page: 20, page: 0 });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/employers/1740/vacancies/active");
  });
});

describe("resumes", () => {
  it("search_resumes builds query with professional_role", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [], found: 0 });

    await handleSearchResumes({
      text: "python",
      professional_role: 96,
      per_page: 20,
      page: 0,
    });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/resumes?");
    expect(callUrl).toContain("professional_role=96");
  });

  it("get_resume fetches by ID", async () => {
    mockHhGet.mockResolvedValueOnce({ id: "abc123", title: "Python Developer" });

    const result = await handleGetResume({ resume_id: "abc123" });

    expect(mockHhGet).toHaveBeenCalledWith("/resumes/abc123");
    expect(JSON.parse(result).title).toBe("Python Developer");
  });
});

describe("references", () => {
  it("get_areas returns area tree", async () => {
    mockHhGet.mockResolvedValueOnce([{ id: "113", name: "Russia", areas: [] }]);

    const result = await handleGetAreas();
    expect(JSON.parse(result)[0].name).toBe("Russia");
  });

  it("get_professional_roles returns role tree", async () => {
    mockHhGet.mockResolvedValueOnce({ categories: [{ id: "1", name: "IT" }] });

    const result = await handleGetProfessionalRoles();
    expect(mockHhGet).toHaveBeenCalledWith("/professional_roles");
  });

  it("get_dictionaries returns all dictionaries", async () => {
    mockHhGet.mockResolvedValueOnce({ currency: [], experience: [] });

    await handleGetDictionaries();
    expect(mockHhGet).toHaveBeenCalledWith("/dictionaries");
  });
});

describe("suggests", () => {
  it("suggest_positions autocompletes job titles", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [{ id: "96", text: "Programmer" }] });

    const result = await handleSuggestPositions({ text: "prog" });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/suggests/professional_roles");
    expect(callUrl).toContain("text=prog");
  });

  it("suggest_companies autocompletes company names", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [{ id: "1740", text: "Yandex" }] });

    await handleSuggestCompanies({ text: "yan" });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/suggests/companies");
  });

  it("suggest_areas autocompletes city names", async () => {
    mockHhGet.mockResolvedValueOnce({ items: [{ id: "1", text: "Moscow" }] });

    await handleSuggestAreas({ text: "mosc" });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/suggests/areas");
  });
});

describe("salary", () => {
  it("get_salary_statistics queries vacancies with salary filter", async () => {
    mockHhGet.mockResolvedValueOnce({ found: 500, items: [] });

    await handleGetSalaryStatistics({ professional_role_id: 96, area_id: 1 });

    const callUrl = mockHhGet.mock.calls[0]![0];
    expect(callUrl).toContain("/vacancies?");
    expect(callUrl).toContain("professional_role=96");
    expect(callUrl).toContain("area=1");
    expect(callUrl).toContain("only_with_salary=true");
  });
});
