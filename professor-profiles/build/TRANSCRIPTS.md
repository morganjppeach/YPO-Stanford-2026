# Adding session transcripts to a professor's RAG

When you have a session/lecture transcript, you can drop it straight into the matching professor's
knowledge base so that professor's agent (and the Faculty Concierge) can answer business-problem
questions grounded in what was actually said in the room.

## How to do it — just paste it to Claude Code

In a Claude Code session in this repo, paste the transcript (or point to a file) and say something like:

> "Here's the transcript for Baba Shiv's session — ingest it."

or simply:

> "/ingest-professor-transcript" and then paste the transcript.

That runs the **`ingest-professor-transcript`** skill (in `.claude/skills/`), which will:

1. **Confirm the professor** — it tells you who it matched (e.g. "this is Baba Shiv / `baba-shiv`") and
   waits for your **yes** before writing anything.
2. **Store the raw transcript** in `professor-profiles/transcripts/<slug>-<date>.raw.md`.
3. **Clean it minimally** — strips ASR noise/filler, fixes obvious errors, keeps all substance and the
   professor's own words → `…-<date>.clean.md`.
4. **Chunk + push into `kb-<slug>`** as `source_type=transcript` rows (auto-vectorized).
5. **Verify and report** rows added.

No agent reconfiguration is needed — every professor agent already searches its own KB, and the
Concierge searches all of them.

## Good to include when you paste
- The professor's name (helps confirmation; not required — it can infer from content).
- The session **date** (used for the `date` field and filenames; defaults to today if omitted).
- A **recording/source URL** if you have one (becomes the citation link).

## Re-ingesting
If you ingest the same session again, tell Claude — it will remove the prior transcript rows for that
date before adding the new ones, so the KB doesn't get duplicates.

## Where things live
- Raw + cleaned transcripts: `professor-profiles/transcripts/` (committed to the repo = durable record).
- Retrieval copy: the professor's `kb-<slug>` in Relevance.AI (project `a77745d3-…`, region `bcbe5a`).
- Roster / agent ids / KB names: see `.claude/skills/ingest-professor-transcript/SKILL.md` and
  `professor-profiles/agents-manifest.json`.
