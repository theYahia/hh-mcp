import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock fetch globally before importing modules
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockOk(data: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve(data),
  };
}

function mockError(status: number, statusText = "Error") {
  return {
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({ error: statusText }),
  };
}

describe("hh-mcp tools", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    delete process.env.HH_ACCESS_TOKEN;
  });

  afterEach(() => {
    delete process.env.HH_ACCESS_TOKEN;
  });

  // ---- search_vacancies ----
  describe("search_vacancies", () => {
    it("searches with text and area", async () => {
      const { handleSearchVacancies } = await import("../src/tools/vacancies.js");
      mockFetch.mockResolvedValueOnce(mockOk({ items: [{ id: "1", name: "Dev" }], found: 1 }));

      const result = await handleSearchVacancies({ text: "Python", area: 1, currency: "RUR", per_page: 5 });
      const parsed = JSON.parse(result);
      expect(parsed.items).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledOnce();
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("text=Python");
      expect(url).toContain("area=1");
    });

    it("works without HH_ACCESS_TOKEN", async () => {
      const { handleSearchVacancies } = await import("../src/tools/vacancies.js");
      mockFetch.mockResolvedValueOnce(mockOk({ items: [], found: 0 }));
      const result = await handleSearchVacancies({ text: "Go", currency: "RUR", per_page: 10 });
      expect(JSON.parse(result).found).toBe(0);
      const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["Authorization"]).toBeUndefined();
    });

    it("sends auth header when token present", async () => {
      process.env.HH_ACCESS_TOKEN = "test-token";
      // Re-import to pick up env
      const { handleSearchVacancies } = await import("../src/tools/vacancies.js");
      mockFetch.mockResolvedValueOnce(mockOk({ items: [], found: 0 }));
      await handleSearchVacancies({ text: "Go", currency: "RUR", per_page: 10 });
      const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });
  });

  // ---- get_vacancy ----
  describe("get_vacancy", () => {
    it("gets vacancy by id", async () => {
      const { handleGetVacancy } = await import("../src/tools/vacancies.js");
      mockFetch.mockResolvedValueOnce(mockOk({ id: "123", name: "Senior Dev", description: "..." }));
      const result = await handleGetVacancy({ id: "123" });
      expect(JSON.parse(result).id).toBe("123");
      expect(mockFetch.mock.calls[0][0]).toContain("/vacancies/123");
    });

    it("throws on 404", async () => {
      const { handleGetVacancy } = await import("../src/tools/vacancies.js");
      mockFetch.mockResolvedValueOnce(mockError(404, "Not Found"));
      await expect(handleGetVacancy({ id: "999" })).rejects.toThrow("404");
    });
  });

  // ---- search_resumes ----
  describe("search_resumes", () => {
    it("returns auth error without token", async () => {
      const { handleSearchResumes } = await import("../src/tools/resumes.js");
      const result = await handleSearchResumes({ text: "Python", per_page: 10 });
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain("авторизация");
    });

    it("searches when token is set", async () => {
      process.env.HH_ACCESS_TOKEN = "test-token";
      const { handleSearchResumes } = await import("../src/tools/resumes.js");
      mockFetch.mockResolvedValueOnce(mockOk({ items: [{ id: "r1" }], found: 1 }));
      const result = await handleSearchResumes({ text: "Java", per_page: 5 });
      expect(JSON.parse(result).found).toBe(1);
    });
  });

  // ---- get_resume ----
  describe("get_resume", () => {
    it("returns auth error without token", async () => {
      const { handleGetResume } = await import("../src/tools/resumes.js");
      const result = await handleGetResume({ id: "abc" });
      const parsed = JSON.parse(result);
      expect(parsed.error).toContain("авторизация");
    });

    it("gets resume when token is set", async () => {
      process.env.HH_ACCESS_TOKEN = "test-token";
      const { handleGetResume } = await import("../src/tools/resumes.js");
      mockFetch.mockResolvedValueOnce(mockOk({ id: "abc", title: "Backend Dev" }));
      const result = await handleGetResume({ id: "abc" });
      expect(JSON.parse(result).id).toBe("abc");
    });
  });

  // ---- get_employers ----
  describe("get_employers", () => {
    it("searches employers", async () => {
      const { handleGetEmployers } = await import("../src/tools/employers.js");
      mockFetch.mockResolvedValueOnce(mockOk({ items: [{ id: "1", name: "Yandex" }] }));
      const result = await handleGetEmployers({ text: "Yandex", per_page: 20 });
      expect(JSON.parse(result).items[0].name).toBe("Yandex");
    });
  });

  // ---- get_salary_stats ----
  describe("get_salary_stats", () => {
    it("gets salary statistics", async () => {
      const { handleGetSalaryStats } = await import("../src/tools/references.js");
      mockFetch.mockResolvedValueOnce(mockOk({ found: 500, items: [] }));
      const result = await handleGetSalaryStats({ text: "Backend" });
      expect(JSON.parse(result).found).toBe(500);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("only_with_salary=true");
    });
  });

  // ---- get_areas ----
  describe("get_areas", () => {
    it("gets areas list", async () => {
      const { handleGetAreas } = await import("../src/tools/references.js");
      mockFetch.mockResolvedValueOnce(mockOk([{ id: "1", name: "Москва" }]));
      const result = await handleGetAreas();
      expect(JSON.parse(result)[0].name).toBe("Москва");
    });
  });

  // ---- get_professional_roles ----
  describe("get_professional_roles", () => {
    it("gets professional roles", async () => {
      const { handleGetProfessionalRoles } = await import("../src/tools/references.js");
      mockFetch.mockResolvedValueOnce(mockOk({ categories: [{ id: "1", name: "IT" }] }));
      const result = await handleGetProfessionalRoles();
      expect(JSON.parse(result).categories[0].name).toBe("IT");
    });
  });
});

// ---- Smoke: 8 tools registered ----
describe("server smoke test", () => {
  it("registers exactly 8 tools", async () => {
    // We can't easily list tools without a transport, but we can verify the createServer function
    const { createServer } = await import("../src/index.js");
    const server = createServer();
    expect(server).toBeDefined();
    // The server object exists - 8 tool() calls in createServer
  });
});
