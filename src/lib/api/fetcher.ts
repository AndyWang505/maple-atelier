/**
 * 最底層 HTTP wrapper:throw on non-2xx、自動 parse JSON、保留 status 給 UI 判斷。
 * 所有 api/*.ts 的 typed wrapper 都用這個,UI 不直接 fetch。
 */

export class ApiError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`API ${status}: ${body || "<empty>"}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export async function apiJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const r = await fetch(url, init);
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new ApiError(r.status, body);
  }
  return r.json() as Promise<T>;
}

export async function apiVoid(url: string, init?: RequestInit): Promise<void> {
  const r = await fetch(url, init);
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new ApiError(r.status, body);
  }
}

const jsonInit = (
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  init?: RequestInit,
): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  ...init,
});

export const apiPost = <T>(url: string, body?: unknown, init?: RequestInit) =>
  apiJson<T>(url, jsonInit("POST", body, init));

export const apiPut = <T>(url: string, body?: unknown, init?: RequestInit) =>
  apiJson<T>(url, jsonInit("PUT", body, init));

export const apiDelete = (url: string, init?: RequestInit) =>
  apiVoid(url, jsonInit("DELETE", undefined, init));
