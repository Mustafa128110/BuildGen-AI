import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

export async function freePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

export async function startApp(environment) {
  assert.ok(existsSync(".next/BUILD_ID"), "Run npm run build first");
  const port = await freePort(), base = `http://127.0.0.1:${port}`;
  let logs = "";
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...environment },
  });
  child.stdout.on("data", (v) => { logs += v; });
  child.stderr.on("data", (v) => { logs += v; });
  async function stop() {
    if (child.exitCode !== null) return;
    const done = once(child, "exit"); child.kill(); await done;
  }
  try {
    const deadline = Date.now() + 25000;
    while (true) {
      if (child.exitCode !== null) throw new Error(logs);
      try { if ((await fetch(base + "/sign-in")).ok) break; } catch { /* Wait for startup. */ }
      assert.ok(Date.now() < deadline, logs || "Application startup timed out");
      await delay(100);
    }
    return { base, stop };
  } catch (error) { await stop(); throw error; }
}

export function cookieHeader(jar = {}) {
  return Object.entries(jar).map(([name, value]) => `${name}=${value}`).join("; ");
}

export function rememberCookies(response, jar) {
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(";"), i = pair.indexOf("="), name = pair.slice(0, i);
    if (/max-age=0/i.test(cookie)) delete jar[name];
    else jar[name] = pair.slice(i + 1);
  }
}

export function httpClient(base) {
  return {
    async post(path, body, jar = {}, headers = {}) {
      const response = await fetch(base + path, { method: "POST", redirect: "manual",
        headers: { Origin: base, "Content-Type": "application/json", Cookie: cookieHeader(jar), ...headers }, body: JSON.stringify(body) });
      rememberCookies(response, jar); return response;
    },
    get: (path, jar = {}, headers = {}) => fetch(base + path, { redirect: "manual", headers: { Cookie: cookieHeader(jar), ...headers } }),
  };
}
