# Feature ownership and extension guide

The application is a modular Next.js application. Features own their views, state, domain types, operations and fixtures. They share explicit contracts and the public authentication client; they never import another feature's implementation or page. No event bus, global feature store, service container or new deployment unit is required.

Route URLs, original JSX markup, CSS, static HTML and assets are preserved. Existing directories remain as compatibility adapters. Source files moved to establish ownership; the UI was not redesigned. Sample data, local-only project edits, simulated copilot output and static validation/quantity fixtures remain academic demonstrations. Moving them does not implement AI, persistence or real engineering validation.

## Dependency direction

```text
app/<route>/page.tsx -> features/<owner>/page.ts
                         -> <owner>-page.tsx       rendering
                         -> use-<owner>.ts         local state/actions
                         -> model/ and services/   domain operations
                         -> data/                  owned fixtures

proxy.ts -> lib/feature-registry.ts -> member-route policy
app/<member>/layout.tsx -> auth MemberLayout -> lib/auth/server.ts

features/* -> shared/contracts/*              explicit shared values/types
features/* -> shared/hooks/*                  per-instance UI infrastructure
features/* -> features/auth/client.ts         public identity/session capability
```

`lib/feature-registry.ts` centrally describes route ownership, without importing implementations or holding live data. Public routes do not trigger proxy authentication. Member routes retain independent server layout checks. APIs must authenticate and authorize their own records; registration in the route policy never replaces authorization or RLS.

All Next page files, including the projects, CAD and login aliases, select their feature's public `page.ts`. Pages no longer import other pages. Auth API/confirmation routes retain the tested server facade. The static about route delegates file delivery to the marketing server adapter; its HTML remains in its original location.

## Current owners

| Feature | Implementation / public entries | Responsibility |
| --- | --- | --- |
| Marketing | `features/marketing`, public `page.ts`, `server.ts` | Landing/about delivery; local visual controls, content and animations. |
| Projects | `features/projects`, public `page.ts` | Dashboard/projects alias; local list state, filtering, sorting, creation and sample data. |
| Studio | `features/studio`, public `page.ts` | Studio/CAD alias; local viewport/tool state, stamps, inspection and simulated copilot proposals. |
| Requirements | `features/requirements`, public `page.ts` | Brief/plot/room/adjacency state, confirmation simulation and fresh defaults. |
| Authentication | `features/auth`, public `page.ts`, `client.ts`, `member-layout.tsx`, `sign-in-modal.tsx`; backend `lib/auth` | Account rendering/state, identity provider, HTTP transport and verified server workflows. |
| Drafting widgets | `features/drafting`, widget adapters, public `contracts.ts`, `fixtures.ts` | Existing Konva/SVG toolkit with separate controllers, types, geometry and fixture data. Retained independently of active studio. |

The auth backend stays under its established `lib/auth` boundary. Its server-only `server.ts` facade delegates to separate configuration, validation, service, session, profile, cookie and HTTP modules. Only `provider.ts` imports the Supabase SDK. See [authentication.md](authentication.md).

Legacy `components/cad`, `components/auth`, `context/AuthContext`, `types/cad` and `data/initialCadState` paths forward to the owner. They contain no second implementation or state store. New feature code cannot import those compatibility adapters.

## Sharing information

`shared/contracts/project.ts` defines the small project handoff (`name`, `code`) and shared sample identity catalogue. Projects and studio use identical names/codes without importing each other's datasets. The catalogue and entries are frozen; resolution returns copies and safely handles unknown IDs, including JavaScript prototype-property names.

Shared hooks handle hydration, lifecycle-owned timeouts and toasts. Each invocation owns its state/timers. Leaving a feature cancels its pending timers. Studio animations target its own root rather than global selectors. `shared/animation.ts` owns GSAP plugin/ticker configuration so visiting marketing does not silently reconfigure a later feature's animation infrastructure. Features import that adapter rather than configuring the vendor singleton.

Other state is not implicitly synchronized. For a new integration, define the smallest serializable contract and connect public capabilities at an application composition point. Pass IDs, typed snapshots or callbacks; keep repositories/state inside the owner. Cross-feature implementation imports are rejected. Do not introduce shared mutable singletons or import a page to access its data. Server integrations must validate input and authorize the current user.

## Adding a feature

1. Create `src/features/<name>`. Put pure rules/types in `model`, use cases in `services`, owned fixtures in `data`, state in local controllers/hooks, and JSX in views/components. Add only necessary layers. Mark server adapters `server-only` and keep secrets out of client entries.
2. Export its view from `page.ts`. Keep the Next page as `export { default } from "@/features/<name>/page";`. Compose HTTP adapters under `app/api` when needed.
3. Register actual route ownership in `lib/feature-registry.ts`. Register member prefixes/aliases and use the existing `MemberLayout`. Authenticate and authorize every new member API independently.
4. Keep state local. Publish small type contracts through `contracts.ts` or genuinely common `shared/contracts` definitions. Connect features through explicit application composition. Shared folders must not become collections of feature-specific behavior.
5. Put tests under `tests/<name>/unit`, `integration` or `browser`. Mocks and test fixtures remain under `tests`. Add the feature's test glob to the appropriate package script.
6. Run `npm test` and `npm run lint`. Every build runs dependency-boundary checks before compilation. Checks reject cycles, alias/relative/dynamic cross-feature implementation imports, route dependencies, shared-to-feature coupling, UI dependencies in domain modules, and misplaced SDK/test imports.

## Evidence and limits

Tests compare original JSX fingerprints with the extracted views/components and compare original CSS/HTML/asset bytes. Domain tests cover project operations, independent defaults, studio proposals, geometry and shared contracts. HTTP/browser tests cover authentication, route aliases, projects-to-studio handoff, requirements editing and mobile member views.

Next.js, React, route policy and existing global styles remain shared infrastructure. Contract changes, global CSS edits and new integrations still require review and regression tests. Feature separation reduces accidental coupling; it cannot guarantee arbitrary future code will never break behavior. The preserved academic sample features have not become production persistence, AI or engineering calculations.
