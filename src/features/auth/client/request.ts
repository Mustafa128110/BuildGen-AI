import type { AuthResult } from "@/lib/auth/types";

export async function authRequest(path: string, body?: unknown): Promise<AuthResult> {
  try {
    const response = await fetch(`/api/auth/${path}`, {
      method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000),
    });
    const result: AuthResult = await response.json();
    return { ...result, success: response.ok && result.success === true };
  } catch { return { success: false, error: "Authentication could not be reached. Please try again." }; }
}
