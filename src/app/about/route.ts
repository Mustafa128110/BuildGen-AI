import { readAboutPage } from "@/features/marketing/server";

export async function GET() {
  return new Response(await readAboutPage(), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
