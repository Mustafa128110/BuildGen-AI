# Application-wide refactor review

Validated locally on 9 November 2026. This document covers the authentication hardening and application-wide feature refactor included in the release commit.

## What changed and why

- **Feature ownership:** marketing, auth, projects, studio, requirements and retained drafting widgets have their own implementation directories. Page files now select public entries rather than importing other pages. This separates feature changes from Next route composition.
- **Rendering versus behavior:** original JSX lives in feature views; controllers own local state/actions. Project operations, studio proposal rules, requirements defaults and drafting geometry have pure, independently testable modules. Sample datasets are separate from rendering.
- **Explicit information sharing:** projects/studio use the small shared project-reference contract. Sample identity entries are immutable, unknown IDs are handled safely, and returned metadata is copied. Features cannot import another owner's private modules.
- **Shared infrastructure:** GSAP configuration has one application-level adapter. Timers/toasts belong to each hook instance and are cancelled on unmount. Studio animation targets are scoped to its root. Hydration detection supports the retained browser-only Konva renderer.
- **Compatibility:** original routes, aliases, component/type/data/context import locations and auth HTTP/server contracts remain available. Compatibility files forward to a single implementation.
- **Enforced boundaries:** builds run dependency and registry checks. The checks cover the entire TypeScript source graph, public entries, type-only contracts, cycles, shared-to-feature dependencies, route coupling, domain/UI direction, misplaced vendor imports and runtime/test separation. Negative cases verify that alias, relative, dynamic, normalized and JS-extension import paths cannot bypass the checks.
- **Separate tests:** all tests and mock infrastructure remain under `/tests`, grouped by feature. The lint configuration excludes only the existing generated Nuxt, Basis and Draco vendor assets; authored source/tests remain covered. Literal double-slash UI labels and existing marketing document navigation retain narrowly documented lint exceptions.

## Results

| Check | Result |
| --- | --- |
| Auth unit + platform | 27 passed |
| Feature/shared domain tests | 13 passed |
| Auth HTTP integration | 25 passed |
| Auth browser journey | 1 passed |
| Feature browser journeys | 4 passed |
| Unique tests total | **70 passed, 0 failed** |
| Production build | Passed, including TypeScript, route generation and boundary gate |
| Lint | 0 errors, 8 retained UI warnings |
| UI preservation | All original JSX fingerprints match; CSS, static HTML and public assets retain original hashes |

Browser coverage includes marketing/about/login, project search/sort/creation and studio handoff, studio modes/proposals, requirements editing, route aliases, mobile member views, signup/sign-in/signout and access denial. Screenshots are generated under `tests/artifacts`, which is Git-ignored. These are browser checks against a production Next build and a test-only local provider.

The retained lint warnings concern existing font tags, image tags and three unused UI bindings. Altering those views was unnecessary for feature separation. No dependencies or lockfile changes were needed.

Pre-push review also removed inherited trailing whitespace from six extracted files. TypeScript emitted identical JavaScript before and after this formatting cleanup. JSX fingerprints normalize line endings and trailing formatting spaces against the original workspace source; static assets remain byte-identical.

## Repository handoff

The environment template lists only the Supabase settings consumed by this application. Server-only variable names are preferred; the previously supported public variable names remain compatible. No actual provider credentials are included. Node.js 24+ and an installed Chrome are documented test prerequisites.

Local review/report/temp folders, installed tools, build output, logs, credentials and generated screenshots are ignored and kept on disk. In the current FYP workspace, `tmp`, `review`, `outputs` and `output` are siblings of `BuildGen-AI`, so they are already outside the repository; the ignore rules also protect copies created inside it. The removed architecture/authentication PDF is superseded by these maintained Markdown guides.

## Scope limits

Feature separation reduces accidental coupling; it is not a guarantee against incorrect future integrations. Shared contracts, route policy and global styles still require review and regression tests. Sample project edits remain local, copilot responses remain simulated, and retained quantity/validation displays remain static academic fixtures. No new database persistence or real AI/engineering service was introduced. Hosted Supabase configuration, actual email delivery and deployed RLS remain external verification tasks.

Use [architecture.md](architecture.md) for the extension pattern and [tests/README.md](../tests/README.md) for commands.
