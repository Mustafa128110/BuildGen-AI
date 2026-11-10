import { isMemberPath } from "../feature-registry";
// Compatibility exports keep every existing UI import unchanged.
export { MEMBER_PATHS, isMemberPath } from "../feature-registry";

// Redirect destinations are untrusted input, even when supplied by our own form.
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || value.length > 1024 || /[\\\u0000-\u001f\u007f]/.test(value)) return "/dashboard";
  try {
    const url = new URL(value, "https://buildgen.invalid");
    if (url.origin !== "https://buildgen.invalid" || url.pathname.includes("%") || !isMemberPath(url.pathname)) {
      return "/dashboard";
    }
    return url.pathname + url.search;
  } catch {
    return "/dashboard";
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export interface Credentials { email: string; password: string; remember: boolean }
export interface Registration extends Credentials { fullName: string; organization: string }

function record(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

export function validateCredentials(input: unknown): Result<Credentials> {
  if (!record(input) || typeof input.email !== "string" || typeof input.password !== "string") {
    return { ok: false, error: "Enter your email address and password." };
  }
  const email = input.email.trim().toLowerCase();
  const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;
  if (email.length > 254 || !emailPattern.test(email)) return { ok: false, error: "Enter a valid email address." };
  // Passwords are opaque secrets: never trim, normalize or SQL-escape them.
  if (!input.password.length || input.password.length > 128 || input.password.includes("\u0000")) {
    return { ok: false, error: "Enter a password between 1 and 128 characters." };
  }
  if (input.remember !== undefined && typeof input.remember !== "boolean") {
    return { ok: false, error: "Invalid session preference." };
  }
  return { ok: true, value: { email, password: input.password, remember: input.remember === true } };
}

export function validateRegistration(input: unknown): Result<Registration> {
  const credentials = validateCredentials(input);
  if (!credentials.ok) return credentials;
  if (!record(input) || typeof input.fullName !== "string" || typeof input.confirmPassword !== "string") {
    return { ok: false, error: "Enter your name and confirm your password." };
  }
  if (input.organization !== undefined && typeof input.organization !== "string") {
    return { ok: false, error: "Organization must be text." };
  }
  const fullName = input.fullName.trim().replace(/\s+/g, " ");
  const rawOrganization = typeof input.organization === "string" ? input.organization : "";
  const organization = rawOrganization.trim().replace(/\s+/g, " ");
  if (fullName.length < 2 || fullName.length > 80 || /[<>\u0000-\u001f\u007f]/.test(input.fullName)) {
    return { ok: false, error: "Enter a name of 2-80 characters without markup or control characters." };
  }
  if (organization.length > 120 || /[<>\u0000-\u001f\u007f]/.test(rawOrganization)) {
    return { ok: false, error: "Organization must be at most 120 characters without markup or control characters." };
  }
  if (credentials.value.password.length < 12) return { ok: false, error: "Use a password of at least 12 characters." };
  if (input.confirmPassword !== credentials.value.password) return { ok: false, error: "Passwords do not match." };
  return { ok: true, value: { ...credentials.value, fullName, organization } };
}
