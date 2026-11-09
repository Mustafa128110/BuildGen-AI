# Separate, feature-owned tests

All tests, mocks, browser drivers and generated test artifacts live under `/tests`. Application code never imports tests. Use Node 24+ for native TypeScript stripping. Browser suites need installed Chrome; set `CHROME_PATH` if it differs from the default Windows location.

| Directory | Coverage |
| --- | --- |
| `auth/unit` | Configuration and input validation. |
| `auth/integration` | Production Next HTTP routes, sessions, confirmation, security and failures. |
| `auth/browser` | Signup/sign-in/member/signout journey and mobile signup. |
| `projects/unit` | Filtering, sorting and creation without input mutation. |
| `studio/unit` | Proposal rules, priority and independent results. |
| `requirements/unit` | Room/connectivity defaults and per-instance isolation. |
| `drafting/unit` | Snapping, distance and area semantics. |
| `shared/unit` | Project identity handoff, immutable catalogue and unknown IDs. |
| `features/browser` | Marketing/about/login; projects/studio/requirements interactions, aliases and mobile routes. |
| `platform` | Boundaries, negative cases, cycles, route registry, unchanged JSX and static assets. |
| `support`, `auth/support`, `platform/support` | Test-only loaders, server lifecycle, mock provider and analyzers. |
| `artifacts` | Git-ignored generated screenshots. |

```powershell
npm test                       # full sequence, builds before HTTP/browser suites
npm run test:auth              # auth unit + platform checks
npm run test:features          # feature/shared domain tests
npm run test:boundaries        # source graph + negative cases
npm run build                 # boundary gate + production build
npm run test:auth-flow         # needs current production build
npm run test:auth-browser      # needs current production build + Chrome
npm run test:features-browser  # needs current production build + Chrome
npm run lint
```

HTTP/browser suites launch isolated local production servers and a test-only GoTrue-compatible provider. No real Supabase account or database is changed. Hosted email delivery, production RLS and real AI are not verified by these tests.

`platform/fixtures/ui-baseline.json` keeps original static-file hashes. `ui-markup-baseline.json` keeps original JSX fingerprints and their destination files, normalizing line endings and trailing formatting whitespace. Imports, controllers and locations can change without hiding markup regressions. Baselines come from the pre-refactor workspace, including previously approved auth changes, not the older Git HEAD.
