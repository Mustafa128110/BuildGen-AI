import test from "node:test";
import assert from "node:assert/strict";
import { safeReturnTo, isMemberPath, validateCredentials, validateRegistration } from "../../../src/lib/auth/validation.ts";

const registration = { fullName: "Alex O'Connor", organization: "Student Studio", email: "  Alex@Example.com ", password: "  Exact Password 42!  ", confirmPassword: "  Exact Password 42!  " };

test("normalizes email and display names without modifying passwords", () => {
  const result = validateRegistration({ ...registration, fullName: "  Alex   O'Connor  " });
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "alex@example.com");
  assert.equal(result.value.fullName, "Alex O'Connor");
  assert.equal(result.value.password, registration.password);
});

test("rejects invalid email, including SQL-like whitespace and markup payloads", () => {
  for (const email of ["' OR 1=1 --", "a@example.com' OR '1'='1", "<script>@example.com", "a\n@example.com", "a@", "", "a".repeat(255) + "@example.com"]) {
    assert.equal(validateCredentials({ email, password: "test" }).ok, false);
  }
});

test("rejects malformed JSON values and non-boolean persistence choices", () => {
  for (const payload of [null, [], "text", {}, { email: 42, password: "test" }, { email: "a@example.com", password: 42 }, { email: "a@example.com", password: "test", remember: "false" }]) {
    assert.equal(validateCredentials(payload).ok, false);
  }
});

test("signup requires matching passwords of 12-128 characters", () => {
  for (const input of [{ ...registration, password: "short", confirmPassword: "short" }, { ...registration, confirmPassword: "different password" }, { ...registration, password: "a".repeat(129) }, { ...registration, password: "hello\0world123" }]) {
    assert.equal(validateRegistration(input).ok, false);
  }
});

test("validates display metadata without discarding legitimate apostrophes", () => {
  assert.equal(validateRegistration(registration).ok, true);
  for (const fullName of ["A", "a".repeat(81), "<script>alert(1)</script>", "A\0B", "A\nB"]) assert.equal(validateRegistration({ ...registration, fullName }).ok, false);
  assert.equal(validateRegistration({ ...registration, organization: "x".repeat(121) }).ok, false);
  assert.equal(validateRegistration({ ...registration, organization: {} }).ok, false);
  assert.equal(validateRegistration({ ...registration, organization: "abc\u0000def" }).ok, false);
});

test("requires actual credentials for login but permits existing shorter passwords", () => {
  assert.equal(validateCredentials({ email: "a@example.com", password: "real-existing-secret" }).ok, true);
  assert.equal(validateCredentials({ email: "a@example.com", password: "" }).ok, false);
});

test("all member routes and aliases are identified", () => {
  for (const path of ["/studio", "/cad", "/dashboard", "/projects", "/requirements", "/studio/nested"]) assert.equal(isMemberPath(path), true);
  for (const path of ["/", "/about", "/sign-in", "/studioevil"]) assert.equal(isMemberPath(path), false);
});

test("return destinations cannot redirect off site or into public/auth routes", () => {
  for (const next of [null, "https://evil.example/studio", "//evil.example/studio", "/\\evil.example/studio", "javascript:alert(1)", "/sign-in", "/api/auth/login", "/studio/%2f%2fevil", "/studio\n", "/studio/../../about"]) assert.equal(safeReturnTo(next), "/dashboard");
  assert.equal(safeReturnTo("/studio?project=example"), "/studio?project=example");
  assert.equal(safeReturnTo("/projects"), "/projects");
});
