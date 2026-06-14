# scripts/

Operational scripts for the Professor Council. **Credit-spending scripts are flagged.**

| Script | Status | Spends credits? | Purpose |
|---|---|---|---|
| `check-connection.mjs` | ready | **No** — read-only `Agent.getAll()` | Verify your Relevance key/region/project work before we build anything. |
| `ingest-lecture.mjs` | _built in Phase 4_ | Yes (transcription + knowledge insert) — will warn first | Weekly: audio → transcript → chunk + tag → insert into a professor's KB. |
| `manage-tokens.mjs` | _built in Phase 1/5_ | No | Generate / revoke per-student access links. |

## Connectivity check (do this once, after adding your key)

```bash
npm install
npm run check     # or: node --env-file=.env scripts/check-connection.mjs
```

Expected: a short list of your agents and "No agents were run; no credits were spent."
If you see a missing-env or auth error, re-check the three `RELEVANCE_*` values in `.env`.
