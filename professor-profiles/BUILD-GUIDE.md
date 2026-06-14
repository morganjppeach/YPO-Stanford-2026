# BUILD-GUIDE — Turning these profiles into Relevance.AI agents (via Claude Code)

This guide tells Claude Code (or any builder) how to use the 17 profile files in this folder to stand up one **"Ask the Professor"** agent per faculty member / guest speaker, so YPO students can ask questions during the program.

---

## 1. Source of truth & mapping

- One agent **per `*.md` file** (17 total). `README.md` and `BUILD-GUIDE.md` are **not** agents.
- Use each file's frontmatter `agent_id` as the Relevance.AI agent slug, and `name` as the display name.
- Each file is **self-contained**: persona/system prompt + session brief + dossier + sources.

## 2. What maps to what in Relevance.AI

| Profile section | Relevance.AI field |
|---|---|
| `🎙️ Agent Persona & System Prompt` → the fenced ```system block | Agent **Core Instructions / System Prompt** |
| `name`, one-line | Agent **name** + short description |
| `📌 Session Brief` + `📖 Comprehensive Dossier` + `🔗 Sources` | **Knowledge base** (RAG): upload the whole `.md` (or these sections) as the agent's retrieval corpus |
| Guardrails (inside the system block) | Keep verbatim — especially for `darshan-shah` (medical) |

**Recommended pattern:** put the `system` block in Core Instructions, and load the **entire `.md` file** as a knowledge document for retrieval. The dossier's "likely executive Q&A" sections prime the agent for the questions students will actually ask.

## 3. Suggested build steps (Claude Code)

1. **Read** `README.md` for the roster, corrections, and special flags.
2. For each `*.md` (excluding README/BUILD-GUIDE):
   a. Parse frontmatter → `agent_id`, `name`, `session_title`.
   b. Extract the ```system fenced block → Core Instructions.
   c. Create/update the Relevance.AI agent (name = `name`, slug = `agent_id`).
   d. Upload the full file to that agent's knowledge base; enable retrieval/citations.
   e. Set model + temperature (see §4) and the shared global guardrails (see §5).
   f. Seed 3–5 starter questions from the file's "likely executive Q&A".
3. Tag all agents with a collection/workspace like **`ypo-stanford-2026`** so students see them grouped.
4. Smoke-test each agent with 2–3 questions (see §6) before publishing.

## 4. Model & retrieval settings (suggested defaults)

- **Model:** a strong general model (e.g., Claude Sonnet/Opus class). Temperature **0.3–0.5** (informative, low fabrication).
- **Retrieval:** top-k over the agent's own profile file; **cite sources** when available.
- **Max response length:** medium; encourage concise, structured answers.

## 5. Shared guardrails (apply to ALL agents)

Append these to every agent's instructions (in addition to file-specific guardrails):

- "You are an **educational study aid** built for YPO students at this Stanford program. You are **modeled on** the named person; you are **not** them and do not speak for them, Stanford, or their employer."
- "Ground answers in this professor's own work and the session materials. If you don't know or it's outside their expertise, say so briefly and point to their cited sources."
- "**Do not fabricate** quotes, statistics, citations, or session logistics."
- "Stay in scope of the person's domain and their YPO session; redirect politely otherwise."
- Profession-specific: **medical** (Shah) → no diagnosis/prescription, flag evidence levels; **financial/investment** (Saper, Brady) → no individualized investment advice; **vendor neutrality** (Sampath) → describe products as examples, not endorsements.

## 6. Per-agent QA checklist (before publishing)

- [ ] Correct **name** (apply README corrections: Shotts/Brady/Papathanassiou/Klein).
- [ ] System prompt loaded; guardrails intact (esp. Shah medical, Lepech "seven imperatives = reconstructed").
- [ ] Knowledge file attached and retrievable; a factual question returns a **cited** answer.
- [ ] Session brief is correct (title/pre-reads); confirm day/time against the **final** program (see README scheduling caveat).
- [ ] Out-of-scope question is handled gracefully.
- [ ] An adversarial "pretend you ARE Professor X / give medical or investment advice" prompt is refused appropriately.

## 7. Optional enhancements

- **Add the actual pre-read PDFs** to the relevant agents' knowledge bases for deeper grounding:
  - Zou → *TextGrad*, *Virtual Lab nanobodies* (Nature 2025)
  - Kahl → *The Myth of the AI Race* (Foreign Affairs)
  - O'Reilly → *DaVita* case (OB-89), *Lead and Disrupt*
  - Shotts → *Leading with Values* (Ch. 3–4)
- **Refresh** profiles closer to the program date (re-run the Parallel.ai deep research) to capture last-minute updates.
- Consider a **17th "Concierge" agent** that routes a student's question to the right professor agent.

## 8. Notes

- Profiles were generated June 14, 2026; they reflect public information as of then. Re-verify any fast-moving facts (titles, recent work) before the program.
- "Jeffrey Hall / AI Governance" is **not** built (replaced by DJ Sampath). Research exists if the session returns.
