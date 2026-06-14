# Professor Council — YPO Stanford 2026

AI versions of each class professor — individually and as a **Council** panel — that students can
use **without creating any account**. Built on **Relevance AI** (professor agents + per-professor
RAG + a Council Workforce) behind a **gated portal**.

> **Status: planning.** The full design is in **[`PROJECT_PLAN.md`](./PROJECT_PLAN.md)** and is
> awaiting approval. No agents have been built and **no live Relevance calls have been made.** Only
> the Phase 0 environment skeleton exists. Reply **"approved"** to begin building, one phase at a time.

## Repo layout
```
PROJECT_PLAN.md      # the plan — read this first (9 sections + appendix)
BUILD_NOTES.md       # verified findings + Phase 1 runbook (build log)
.env.example         # environment template (copy to .env)
.env                 # your local secrets — GIT-IGNORED, never committed
.gitignore           # excludes .env, node_modules, data/, etc.
package.json         # minimal: just enough to run the connectivity check
professors/          # RAG source material per professor (see professors/README.md)
  _TEMPLATE/         #   copy this to professors/<slug>/ for each professor
scripts/
  check-connection.mjs   # SAFE read-only Relevance check (no credits)
  README.md              # what each script does + credit flags
```

## Phase 0 — environment setup (your steps)

1. **Copy the template:** `cp .env.example .env`
2. **Fill the three Relevance values** in `.env`:
   - `RELEVANCE_API_KEY` — Dashboard → **Settings → API Keys** (project key, format `sk-…`). **Server-side only.**
   - `RELEVANCE_REGION` — `us`, `eu`, or `au` (your project's region).
   - `RELEVANCE_PROJECT_ID` — Dashboard → **Settings**.
   - (Other keys — transcription, portal auth — can stay blank until their phase.)
3. **Verify connectivity** with a single safe, read-only call (lists your agents; **spends no credits**):
   ```bash
   npm install
   npm run check
   ```
   Success looks like: `✓ Connected …` and `No agents were run; no credits were spent.`

## Authentication model (how the key is used)
- The Relevance JS SDK authenticates with `RELEVANCE_API_KEY` + region + project, **server-side only**
  ("Never embed API keys in client-side code … or version control" — Relevance SDK docs).
- The browser never sees the API key: it uses a **scoped embed key minted server-side**, or the
  server **proxies** chat. Details in `PROJECT_PLAN.md` §6 and the appendix.

## Ground rules (from the project brief)
- **Never hard-code secrets.** Keys come from `.env`, server-side only; `.env` is git-ignored.
- **Protect credits.** Any step that spends Relevance credits or calls paid transcription is flagged
  **before** it runs. Hard cap via Relevance **Usage Limits** (see plan §6).
- **No student PII** in logs or client code. The roster is sensitive.
- **Plan first, build second.** Building proceeds only after you approve, one reviewable phase at a time.
