import "server-only";
import { NextRequest, NextResponse } from "next/server";

export function authJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } });
}

export function requestOrigin(request: NextRequest) {
  // Next's internal URL can use localhost even when the browser uses a different
  // host. Compare Origin to the actual Host, not to an untrusted forwarded host.
  const host = request.headers.get("host");
  return host ? new URL(`${request.nextUrl.protocol}//${host}`).origin : request.nextUrl.origin;
}

export async function readAuthBody(request: NextRequest): Promise<{ data: unknown; error?: never } | { error: NextResponse; data?: never }> {
  if (request.headers.get("origin") !== requestOrigin(request) || request.headers.get("sec-fetch-site") === "cross-site") {
    return { error: authJson({ success: false, error: "Request origin is not allowed." }, 403) };
  }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return { error: authJson({ success: false, error: "Send a JSON request." }, 415) };
  }
  const reader = request.body?.getReader();
  if (!reader) return { error: authJson({ success: false, error: "Request body is required." }, 400) };
  try {
    const chunks: Uint8Array[] = []; let length = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) {
        await reader.cancel();
        return { error: authJson({ success: false, error: "Request is too large." }, 413) };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { data: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) };
  } catch { return { error: authJson({ success: false, error: "Invalid JSON request." }, 400) }; }
}

export function authUnavailable() {
  return authJson({ success: false, error: "Authentication is unavailable. Please try again later." }, 503);
}
