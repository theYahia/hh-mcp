const BASE_URL = "https://api.hh.ru";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;
const USER_AGENT = "theYahia-hh-mcp/2.0 (https://github.com/theYahia/hh-mcp)";

// Rate limiter: 5 requests per second
const RATE_LIMIT = 5;
const RATE_WINDOW = 1000;
const timestamps: number[] = [];

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  // Remove timestamps outside the window
  while (timestamps.length > 0 && timestamps[0]! <= now - RATE_WINDOW) {
    timestamps.shift();
  }
  if (timestamps.length >= RATE_LIMIT) {
    const oldest = timestamps[0]!;
    const waitMs = oldest + RATE_WINDOW - now;
    if (waitMs > 0) {
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  timestamps.push(Date.now());
}

export class HhApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body?: string,
  ) {
    super(`hh.ru HTTP ${status}: ${statusText}`);
    this.name = "HhApiError";
  }
}

export async function hhGet(path: string): Promise<unknown> {
  await waitForRateLimit();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
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

      const body = await response.text().catch(() => "");

      // Auth errors — fail immediately
      if (response.status === 401 || response.status === 403) {
        throw new HhApiError(
          response.status,
          response.status === 401
            ? "Unauthorized — set HH_ACCESS_TOKEN env var with a valid OAuth2 bearer token"
            : "Forbidden — token lacks required scope for this endpoint",
          body,
        );
      }

      // Rate limit — use Retry-After header if available
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.min(1000 * 2 ** (attempt - 1), 8000);
        if (attempt < MAX_RETRIES) {
          console.error(
            `[hh-mcp] 429 rate limited, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`,
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw new HhApiError(429, "Rate limited — all retries exhausted", body);
      }

      // Server errors — retry
      if (response.status >= 500 && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(
          `[hh-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw new HhApiError(response.status, response.statusText, body);
    } catch (error) {
      clearTimeout(timer);
      if (
        error instanceof DOMException &&
        error.name === "AbortError" &&
        attempt < MAX_RETRIES
      ) {
        console.error(
          `[hh-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`,
        );
        continue;
      }
      throw error;
    }
  }
  throw new Error("hh.ru: all retries exhausted");
}
