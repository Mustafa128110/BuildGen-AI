# BuildGen AI

Academic architectural design application built with Next.js and React. Marketing, authentication, projects, studio, requirements and retained drafting widgets have separate feature ownership. Existing UI and route URLs are preserved.

Use Node.js 24 or newer. The browser tests also require Chrome; set `CHROME_PATH` if it is not installed at the default Windows location.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Replace the placeholders in `.env.local` before using authentication. On macOS/Linux, use `cp .env.example .env.local`. Open `http://localhost:3000`. Complete the Supabase settings in the [authentication guide](docs/authentication.md). Authentication fails closed without valid settings. Project samples, simulated copilot proposals and static engineering fixtures remain demonstrations; this refactor does not add persistence or real AI services.

Read the [architecture and extension guide](docs/architecture.md) before adding features. Implement features under `src/features/<owner>` and tests under `tests/<owner>`. Next pages select public feature entries. The [test guide](tests/README.md) describes suites and browser prerequisites.

```powershell
npm test
npm run lint
```

Builds automatically check dependency boundaries. Shared infrastructure and public contracts still require regression tests when changed.

Review the [validation results](docs/refactor-validation.md) for verified behavior and scope limits. Local `tmp`, `review`, `outputs`, `output`, tooling, logs, credentials and test screenshots are excluded from Git. Source, documentation, test fixtures and `package-lock.json` belong in the repository. The older architecture/authentication PDF was removed; the Markdown guides are the maintained documentation.
