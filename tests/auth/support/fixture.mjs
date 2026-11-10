import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { startApp, httpClient } from "../../support/app-server.mjs";
import { startProvider } from "./mock-provider.mjs";

export const details = (email = `${randomUUID()}@example.com`) => ({ fullName: "Alex O'Connor", organization: "Student Studio", email,
  password: " Exact Password 42! ", confirmPassword: " Exact Password 42! " });

export async function startFixture() {
  const provider = await startProvider();
  try {
    const app = await startApp({ SUPABASE_URL: provider.url, SUPABASE_ANON_KEY: "test-public-key" });
    const http = httpClient(app.base);
    return { ...app, ...http, provider,
      async account({ login = true, remember = false } = {}) {
        const input = details(), jar = {};
        const registered = await http.post("/api/auth/register", input);
        assert.equal(registered.status, 201, await registered.text());
        if (login) {
          const response = await http.post("/api/auth/login", { email: input.email, password: input.password, remember }, jar);
          assert.equal(response.status, 200, await response.text());
        }
        return { input, jar };
      },
      async stop() { await app.stop(); await provider.stop(); },
    };
  } catch (error) { await provider.stop(); throw error; }
}
