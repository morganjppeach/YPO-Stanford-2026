# Knowledge-base schema & retrieval loading

How each professor's dossier is loaded into a Relevance.AI Knowledge base for RAG, and how optional
pre-read PDFs attach later. Aligns with `../BUILD-GUIDE.md` §2 ("load the entire `.md` file as a
knowledge document") and §7 (optional pre-reads).

## One KB per agent

| Item | Value |
|---|---|
| KB name | `kb-<agent_id>` (e.g., `kb-james-zou`) |
| Primary document | the **entire** `professor-profiles/<agent_id>.md` |
| Scope | the agent searches **only its own** KB (no cross-professor retrieval) |
| Embedding | Relevance default text-embedding model |
| Sync | vectorize/sync on upload so the agent can retrieve immediately |
| Citations | ON — retrieved chunks surface their `title`/`url` in answers |

Per-professor bases (vs. one shared base) make it structurally impossible for one agent to retrieve
another's material, and keep citations clean.

## Chunking

Prefer **section-aware chunking** so each retrievable chunk is a meaningful unit that maps to the
dossier's markdown headings:

- `## 📌 SESSION BRIEF`
- `### Signature frameworks` (TextGrad, Virtual Lab, Paper2Agent, …)
- `### Likely executive Q&A`
- `### Distinctive perspectives & quotes`, etc.

If only fixed-size chunking is available, use **~500–800 tokens with ~10–15% overlap** so a framework's
description and its numbers (e.g., "92 candidates → 2 validated binders") stay in the same chunk.

## Metadata columns (per chunk/row)

Loading the whole `.md` works with zero metadata. These columns are **recommended** so retrieval can be
filtered and so pre-reads slot in cleanly later:

| Column | Example | Purpose |
|---|---|---|
| `content` | the text chunk | embedded + searched |
| `source_type` | `dossier` \| `session-brief` \| `pre-read` | filter dossier vs. session vs. attached paper |
| `title` | "James Zou dossier — Signature frameworks" | citation label in answers |
| `section` | `signature-frameworks`, `executive-qa` | section-scoped retrieval |
| `date` | `2026-06-14` (dossier research date; pre-read = publication date) | recency/filtering |
| `url` | from the dossier's `🔗 SOURCES` | clickable citation |

> Capability note: the exact metadata mechanism (columns on a Knowledge table vs. document-level tags)
> depends on how the KB is created (UI upload vs. an Insert-Knowledge tool step). Confirm against your
> Relevance project; if metadata columns aren't convenient, a whole-file upload with citations ON still
> satisfies BUILD-GUIDE §2/§6.

## Adding pre-reads later (no agent reconfiguration)

Because the agent retrieves over its **whole** KB, adding documents requires **no** change to the agent:

1. Upload the PDF into the **same** `kb-<agent_id>` KB.
2. Tag the rows `source_type=pre-read`, with `title`, `date`, `url`.
3. Re-sync/vectorize. The agent now cites the pre-read automatically.

Pre-reads flagged in BUILD-GUIDE §7:

| Agent | Pre-reads |
|---|---|
| `james-zou` | *TextGrad: AutoGrad for Text* (arXiv 2406.07496); *Virtual Lab … SARS-CoV-2 nanobodies* (Nature, Jul 2025) |
| `colin-kahl` | *The Myth of the AI Race* (Foreign Affairs) |
| `charles-oreilly` | *DaVita* case (OB-89); *Lead and Disrupt* |
| `ken-shotts` | *Leading with Values* (Ch. 3–4) |

Weekly lecture transcripts (future) attach the same way with `source_type=transcript`.
