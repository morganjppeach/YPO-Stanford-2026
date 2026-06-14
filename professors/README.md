# Professor content — authoring guide

This folder holds the **RAG source material** for each professor agent. Your deep research drops in
here in a shape that ingests cleanly into Relevance.

> **Consent gate (from `PROJECT_PLAN.md` §7):** do not ingest a professor's materials until you have
> their written sign-off on (a) the AI persona, (b) ingesting their work/likeness, and (c) recording +
> transcribing lectures. Third-party papers/books may be copyrighted — confirm rights before ingesting.

## How to add a professor

```
cp -r professors/_TEMPLATE professors/<slug>      # slug = lowercase last name, e.g. "duffie"
```
Then fill in:
1. **`professor.json`** — identity, domains (used by the Council to route), persona, guardrails.
2. **`dossier.md`** — your deep-research dossier (the persona backbone). Follow its section headers.
3. **`works/`** — papers/books/public work (+ fill `works/INDEX.md`).
4. **`transcripts/`** — lecture transcripts, added weekly (+ `transcripts/INDEX.md`).

## Folder shape
```
professors/
  <slug>/
    professor.json        # manifest (machine-readable)
    dossier.md            # deep-research dossier (persona backbone)
    agent-instructions.md # generated system prompt for the agent (I draft this from the dossier)
    works/                # their papers/books/public work
    transcripts/          # lecture transcripts (weekly)
```

## Metadata schema (every KB row carries these)

| Field | Values | Purpose |
|---|---|---|
| `content` | the text chunk | what gets embedded/searched |
| `source_type` | `dossier` \| `work` \| `transcript` | filter dossier vs lecture vs publication |
| `title` | e.g. "Asset Pricing, 3rd ed." / "Lecture 4" | citation in answers |
| `date` | `YYYY-MM-DD` (works: publication date; transcripts: lecture date) | recency / filtering |
| `session` | e.g. `04` (transcripts only) | "what did we cover in session 4" |
| `topic` | short slug, e.g. `term-structure` | topic-scoped retrieval |

These map automatically from your files: `dossier.md` → `source_type=dossier`; each `works/` entry →
`source_type=work` (metadata from `works/INDEX.md`); each `transcripts/` file → `source_type=transcript`
(metadata parsed from the filename + `transcripts/INDEX.md`).

## What flows where
- **`dossier.md` + `works/`** → loaded into the professor's KB **once** at setup.
- **`transcripts/`** → appended to the KB **weekly** by the lecture pipeline.
- **`professor.json` + `dossier.md`** → also drive the agent's persona/system prompt and the Council's
  routing keywords.

## Keep out of git
- Large/copyrighted third-party PDFs — prefer uploading those straight to the Relevance KB; keep only a
  citation + link in `works/INDEX.md`. Your own dossier and transcripts (markdown/text) are fine in git.
- Anything with student PII.
