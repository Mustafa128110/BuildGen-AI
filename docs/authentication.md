# Account workflow

Authentication keeps its established HTTP/server contracts. The sign-in view/controller and identity provider now belong to `src/features/auth`; `src/context/AuthContext.tsx` is a compatibility export. Original JSX, styles and the account workflow are preserved. See `architecture.md` for application-wide boundaries.

1. Register at `/sign-in?mode=signup` using a name, email and matching 12-128 character password. Organization is optional. The server calls Supabase Auth; the existing `auth.users` trigger can create the profile.
2. Successful registration returns to `/sign-in?registered=1`. It never issues browser session cookies, even if Supabase returns an automatic session. If Supabase requires email confirmation, the user must confirm before signing in.
3. Sign in with the registered credentials. Only a successful provider response issues HttpOnly cookies. No demo account, arbitrary local identity, or profile-password comparison exists.
4. `/dashboard`, `/projects`, `/studio`, `/cad`, `/requirements` and their descendants require a provider-verified, email-confirmed, non-anonymous identity in both `src/proxy.ts` and server layouts. Membership routes are centrally registered in `src/lib/feature-registry.ts`. Missing configuration or an unavailable provider never grants access. Redirect destinations are restricted to member paths.
5. The account page provides **Sign out** for an authenticated user. It clears cookies and discards the cached member route tree. Session checks also run on focus, restored pages, visibility changes and cross-tab signout notifications.

## Supabase setup to verify later

- Copy `.env.example` to `.env.local` for local development and replace its two placeholders. Never commit `.env.local`. The template describes the current application, without unused database/admin/AI service settings.
- Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` on the server, or retain the existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` names. Only a public/anon key is required; do not use a service-role key. Placeholder settings fail closed.
- Set Supabase's Site URL to the application origin and allow `<origin>/sign-in` as an email redirect. The default email confirmation link can redirect there; returned token fragments are discarded and never used to auto-login.
- The selected OTP flow is registration confirmation by email link, followed by password sign-in. Enable the Email provider and **Confirm email**, and use the following **Confirm signup** email template:

  ```html
  <h2>Confirm your BuildGen account</h2>
  <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&amp;type=email">Confirm email</a></p>
  <p>After confirming, return to BuildGen and sign in with your password.</p>
  ```

  Set Site URL to the actual application origin. `/auth/confirm` calls `verifyOtp({ token_hash, type: 'email' })` and redirects to `/sign-in?confirmed=1`. It issues no login cookies and does not clear a different, already authenticated browser session. A replayed, expired, malformed or unsupported link returns to the existing sign-in error state. No numeric OTP or passwordless-login UI is added.
- The profile lookup uses only `display_name`, `professional_label`, `organization`, `avatar_url`, and `sheets_quota`, scoped by the authenticated user's ID. Missing profile data falls back to that user's verified identity, never another persona. A profile's display label is not an authorization role.
- Provider email delivery, existing users, confirmation settings, password policy, rate limits, and deployed RLS remain to be verified against the real Supabase project. Future member APIs must independently authorize their data operations; these page guards do not replace RLS.

Only `.env.example` exists in the reviewed workspace; no live project connection or email delivery was verified. Once valid runtime URL/key, Site URL, template, delivery and the existing profile trigger/RLS are configured, enabling Email/Confirm email is the remaining provider activation. It would be inaccurate to claim that a single switch is sufficient before those prerequisites are supplied. Secret/service-role keys are rejected for this feature.

## Input and session security

The same validation runs on client and server; bypassing HTML constraints does not bypass server validation. Requests require same-origin JSON and have an 8KiB limit. Email is trimmed/lowercased, names are bounded and reject markup/control characters, and passwords are preserved exactly. Credentials are sent through structured Supabase Auth SDK calls; no raw SQL is built. The profile filter uses a verified user ID through `.eq`, not string-interpolated SQL. Passwords and tokens are never returned in the JSON user view or saved in localStorage. The old `buildgen_auth_user` cache is deleted on startup.

Cookies are HttpOnly, SameSite=Lax, Secure in production, and excluded from shared caching. Without **Keep me signed in**, they are browser-session cookies; opting in allows up to 30 days of cookie persistence, subject to Supabase session/revocation policy. Expired access tokens can refresh server-side, then the replacement token is verified with Supabase before access is granted. Invalid credentials clear cookies; temporary verification/rate-limit failures deny access without clearing them. If verification fails after rotation, replacement cookies are retained so a subsequent retry can recover. No access is granted until verification succeeds. Profile display requests have a 2-second timeout and fall back only to the same verified user's metadata.

## Tests

Use Node 24 or newer (the validation tests use native TypeScript type stripping).

```powershell
npm run test:auth
npm run build
npm run test:auth-flow
npm run test:auth-browser
```

Tests are separated into `tests/auth/unit`, `tests/auth/integration`, `tests/auth/browser`, feature-owned `tests/auth/support`, and shared `tests/support`. `tests/platform` checks dependency direction, route policy, unchanged JSX and static-file hashes. HTTP/browser suites start a **test-only local GoTrue-compatible mock** and production Next.js server; no real account or database is changed. See `tests/README.md` for commands and responsibilities.
