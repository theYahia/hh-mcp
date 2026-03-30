const BASE_URL = "https://api.hh.ru";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;
const USER_AGENT = "theYahia-hh-mcp/1.0 (https://github.com/theYahia/hh-mcp)";

export async function hhGet(path: string): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      "Accept": "application/json",
    };

    const token = process.env.HH_ACCESS_TOKEN;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[hh-mcp] ${response.status}, повтор через ${delay}мс (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`hh.ru HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[hh-mcp] Таймаут, повтор (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("hh.ru: все попытки исчерпаны");
}
