import { readFile } from "node:fs/promises";
import path from "node:path";
import "server-only";

export async function readAboutPage() {
  return readFile(path.join(process.cwd(), "src", "app", "about", "about.html"), "utf8");
}
