import test, { before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { startFixture } from "../../auth/support/fixture.mjs";

let fixture, browser, context, page, errors;
before(async () => {
  fixture = await startFixture();
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true });
  mkdirSync("tests/artifacts/features", { recursive: true });
});
after(async () => { await browser?.close(); await fixture?.stop(); });
beforeEach(async () => {
  context = await browser.createBrowserContext(); page = await context.newPage(); errors = [];
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  page.on("request", request => request.url().startsWith(fixture.base) || /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(request.url()) ? request.continue() : request.abort());
  page.on("pageerror", error => errors.push(error.message));
});
afterEach(async () => { await context?.close(); assert.deepEqual(errors, []); });
const visit = route => page.goto(fixture.base + route, { waitUntil: "networkidle0" });
const clickText = async text => {
  const found = await page.evaluate(text => {
    const button = [...document.querySelectorAll("button")].find(el => el.textContent.trim() === text || [...el.children].some(child => child.textContent.trim() === text));
    button?.click(); return Boolean(button);
  }, text);
  assert.ok(found, `Button missing: ${text}`);
};
async function authenticate() {
  const { input } = await fixture.account({ login: false });
  await visit("/sign-in");
  const status = await page.evaluate(async input => (await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) })).status, input);
  assert.equal(status, 200);
}

test("public marketing, static about and login alias render through their feature entries", { timeout: 40000 }, async () => {
  await visit("/"); assert.ok(await page.$("nav")); assert.ok(await page.$('a[href="/sign-in"]'));
  await page.screenshot({ path: "tests/artifacts/features/marketing.png", fullPage: false });
  const response = await visit("/about"); assert.equal(response.status(), 200); assert.ok((await page.content()).length > 10000);
  await visit("/login"); await page.waitForSelector("#email"); assert.ok(await page.$("#password"));
});

test("projects filter, sort, create and hand off a new project to studio without shared state", { timeout: 45000 }, async () => {
  await authenticate(); await visit("/dashboard"); await page.waitForSelector(".js-project-card:not(.border-dashed)");
  const search = 'input[placeholder="Filter plot ID or typologies..."]';
  await page.type(search, "Kyoto"); await page.waitForFunction(() => document.querySelectorAll(".js-project-card:not(.border-dashed)").length === 1);
  assert.match(await page.$eval(".js-project-card:not(.border-dashed)", el => el.textContent), /Kyoto/);
  await page.$eval(search, el => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; setter.call(el, ""); el.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForFunction(() => document.querySelectorAll(".js-project-card:not(.border-dashed)").length === 5);
  await page.select("select", "area-desc");
  await page.waitForFunction(() => document.querySelector(".js-project-card:not(.border-dashed)")?.textContent.includes("Aero Industrial"));
  await clickText("Blank Architectural Canvas"); await page.waitForSelector("form");
  await page.$eval('form input[type="text"]', el => { el.focus(); el.select(); }); await page.keyboard.type("Feature Isolation Courtyard");
  await page.click('form button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector("form") && document.body.textContent.includes("Feature Isolation Courtyard"));
  const href = await page.$eval('a[href*="project=feature-isolation-courtyard-"]', el => el.getAttribute("href"));
  await page.waitForFunction(() => [...document.querySelectorAll(".js-project-card")].every(el => Number(getComputedStyle(el).opacity) > 0.99));
  await page.screenshot({ path: "tests/artifacts/features/projects.png", fullPage: false });
  await visit(href); await page.waitForFunction(() => document.body.textContent.includes("Feature Isolation Courtyard"));
  assert.match(new URL(page.url()).searchParams.get("project"), /^feature-isolation-courtyard-/);
  await visit("/projects"); assert.equal(await page.$$(".js-project-card:not(.border-dashed)").then(elements => elements.length), 5);
});

test("studio modes, isolated copilot proposals and route aliases keep their behavior", { timeout: 45000 }, async () => {
  await authenticate(); await visit("/cad?project=nordic-horizon&mode=3d");
  await page.waitForFunction(() => document.body.textContent.includes("Nordic Horizon Mixed-Use"));
  await clickText("SECTION");
  await page.waitForFunction(() => [...document.querySelectorAll('input[type="checkbox"]')].some(el => el.checked));
  await clickText("SUN/SHADOW"); await clickText("2D PLAN");
  const prompt = 'textarea[placeholder="Describe spatial or structural modification..."]';
  await page.type(prompt, "Add pergola louvers"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.body.textContent.includes("10 blades @ 120mm"));
  await page.type(prompt, "extrude facade"); await page.keyboard.press("Enter");
  await page.waitForFunction(() => document.body.textContent.includes("Level 02 (+3,600mm)"));
  await page.screenshot({ path: "tests/artifacts/features/studio.png", fullPage: false });
  await visit("/studio?project=kyoto-townhome");
  await page.waitForFunction(() => document.body.textContent.includes("Kyoto Urban Townhome"));
  assert.equal(await page.evaluate(() => document.body.textContent.includes("10 blades @ 120mm")), false);
});

test("requirements edits stay local and mobile member views still render", { timeout: 45000 }, async () => {
  await authenticate(); await visit("/requirements");
  assert.equal(await page.$$("tbody tr").then(rows => rows.length), 5);
  await clickText("ADD ROOM"); await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 6);
  await page.$eval("tbody tr:last-child button", button => button.click());
  await page.waitForFunction(() => document.querySelectorAll("tbody tr").length === 5);
  const dialog = new Promise(resolve => page.once("dialog", async dialog => { const message = dialog.message(); await dialog.accept(); resolve(message); }));
  await clickText("CONFIRM VERSION"); assert.match(await dialog, /REQUIREMENTS CONFIRMED/);
  await page.screenshot({ path: "tests/artifacts/features/requirements.png", fullPage: false });
  await visit("/dashboard"); assert.equal(await page.$$(".js-project-card:not(.border-dashed)").then(cards => cards.length), 5);
  await page.setViewport({ width: 390, height: 844 });
  await visit("/studio"); assert.ok(await page.$(".js-studio-canvas"));
  await page.screenshot({ path: "tests/artifacts/features/mobile-studio.png", fullPage: false });
  await visit("/projects"); assert.ok(await page.$('[aria-label="Toggle workspace sidebar"]'));
});
