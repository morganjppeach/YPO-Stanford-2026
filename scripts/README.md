# scripts/

Operational scripts for the Professor Council. **Credit-spending scripts are flagged.**

| Script | Status | Spends credits? | Purpose |
|---|---|---|---|
| `check-connection.mjs` | ready | **No** — read-only `Agent.getAll()` | Verify your Relevance key/region/project work before we build anything. |
| `inspect-agent.mjs` | ready | **No** — read-only | Show an agent's config + which knowledge sets it can search. `… inspect-agent.mjs <agentId>` |
| `inspect-knowledge.mjs` | ready | **No** — read-only | List knowledge sets + row/chunk/vector counts; show schema + sample rows. `… inspect-knowledge.mjs <set> …` |
| `dump-knowledge.mjs` | ready | **No** — read-only | Print the full content of every row in a knowledge set. `… dump-knowledge.mjs <set>` |
| `ingest-transcript.mjs` | ready | **Yes** (insert + vectorize) — **dry-run by default**; add `--commit` | Chunk a transcript into section-sized, tagged rows and insert into a professor's KB. Has a duplicate-guard. |
| `delete-knowledge.mjs` | ready | No credits — **destructive**, requires `--confirm` | Empty (or `--drop-set`) a knowledge set. |
| `ingest-lecture.mjs` | _built in Phase 4_ | Yes (transcription + knowledge insert) — will warn first | Weekly: audio → transcript → chunk + tag → insert into a professor's KB. |
| `manage-tokens.mjs` | _built in Phase 1/5_ | No | Generate / revoke per-student access links. |

> All scripts read credentials from `.env`. Run them as `node --env-file=.env scripts/<name>.mjs …`.
> The verified REST endpoints these use are documented in `BUILD_NOTES.md`.

## Connectivity check (do this once, after adding your key)

```bash
npm install
npm run check     # or: node --env-file=.env scripts/check-connection.mjs
```

Expected: a short list of your agents and "No agents were run; no credits were spent."
If you see a missing-env or auth error, re-check the three `RELEVANCE_*` values in `.env`.
