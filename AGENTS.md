# Repository Guidelines

## Project Structure & Module Organization

This repository contains two applications:

- `backend/`: FastAPI service with routers, services, repositories, SQLAlchemy models, and Pydantic schemas under `app/`. Alembic migrations live in `backend/alembic/versions/`; pytest tests live in `backend/tests/`.
- `frontend/`: Next.js App Router client. Routes are in `src/app/`, components in `src/components/`, and API clients, validation, state, and types in `src/lib/`, `src/store/`, and `src/types/`. Static assets belong in `frontend/public/`.

Read `frontend/AGENTS.md` before changing frontend code; its more specific rules apply within that directory.

## Build, Test, and Development Commands

Run commands from the relevant application directory.

```bash
cd backend && uv sync                         # install Python dependencies
uv run alembic upgrade head                   # apply database migrations
uv run uvicorn app.main:app --reload           # serve API on port 8080
uv run pytest                                 # run backend tests

cd frontend && pnpm install                   # install JavaScript dependencies
pnpm dev                                      # serve UI on port 3000
pnpm lint                                     # run ESLint
pnpm build                                    # type-check and build production UI
```

## Coding Style & Naming Conventions

Use four-space indentation and `snake_case` for Python modules, functions, and tests; use `PascalCase` for classes. Keep routers thin and database queries in repositories. For TypeScript, preserve strict typing, use two-space indentation, `PascalCase` component filenames (for example, `WalletSheet.tsx`), and `camelCase` functions. Avoid `any`; share API shapes through `src/types/`. Follow the existing ESLint configuration.

## Testing Guidelines

Backend tests use pytest with automatic asyncio support. Name files `test_<behavior>.py` and test functions `test_<expected_outcome>`. Add focused regression coverage for service, wallet-balance, authentication, or routing changes. There is no frontend test runner configured; for frontend work, run `pnpm lint` and `pnpm build`, then manually verify affected routes and responsive states.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commits: `feat(wallets): add per-user default wallet`, `fix(telegram): record transactions against the intended wallet`, and `docs: update README.md`. Use an imperative summary, a relevant scope when useful, and keep unrelated changes separate. Pull requests should explain the problem and solution, list verification commands, link related issues, call out migrations or environment changes, and include screenshots for visible UI updates.

After completing a task, commit the task's changes without asking for separate permission. Do not push unless the user explicitly asks. Do not include LLM or model credits, attribution, or `Co-authored-by` lines in commits.

## Security & Configuration

Copy each app's `.env.example` to a local `.env`. Never commit credentials, JWT secrets, database URLs, Telegram tokens, or Gemini keys. Document new variables in the matching example file and review migrations before applying them to shared databases.
