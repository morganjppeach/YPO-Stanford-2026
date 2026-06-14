# YPO × Stanford GSB 2026 — Faculty & Speaker RAG Profiles

**Purpose:** These files are the research/RAG knowledge base for building one AI agent per program faculty member and guest speaker. Each profile is self-contained and was generated from **Parallel.ai deep research** (processor "pro", June 14, 2026), plus targeted web search where noted. Claude Code will use these as context to build the agents in **Relevance.AI** — see `BUILD-GUIDE.md`.

**Program:** Young Presidents' Organization (YPO) · Stanford Graduate School of Business, Executive Education · **June 14–19, 2026** · Knight Management Center & Schwab Residential Center.

---

## 📁 What's in each profile

Every `*.md` file follows the same structure so the agents come out consistent:

1. **YAML frontmatter** — `agent_id`, name, role, session, day/time, location, identity status, research source.
2. **🎙️ Agent Persona & System Prompt** — a copy-paste-ready system prompt (in a fenced ```system block) for Relevance.AI / Claude Code, including voice, scope, and guardrails.
3. **📌 Session Brief** — the specific YPO session, its description, pre-reads/assignments, and what to be ready to discuss (this is what ties each agent to the program).
4. **📖 Comprehensive Dossier** — bio, expertise, signature frameworks, major works, recent work (2024–26), quotes, and likely executive Q&A.
5. **🔗 Sources** — cited links from the research.

---

## 👥 The 17 profiles

| # | File | Person | Session | Faculty/Guest |
|---|------|--------|---------|---------------|
| 1 | `ken-shotts.md` | **Ken Shotts** *(roster said "Joel")* | Living Up to Your Values | Faculty |
| 2 | `james-zou.md` | James Zou | Multi-Agent AI Teams Accelerating Discovery | Faculty |
| 3 | `scott-brady.md` | **Scott Brady** *(roster said "Sean")* | AI Applications in Silicon Valley | Faculty |
| 4 | `ed-dehaan.md` | Ed deHaan | AI-Powered Accounting & Finance I & II | Faculty |
| 5 | `baba-shiv.md` | Baba Shiv | Architecting the Mind & Body for Success | Faculty |
| 6 | `michael-lepech.md` | Michael Lepech | Organizational Imperatives for AI Value Capture | Faculty |
| 7 | `diyi-yang.md` | Diyi Yang | The Art of the Possible with Generative AI I & II | Faculty |
| 8 | `colin-kahl.md` | Colin Kahl | Geopolitical Implications of the AI Race | Faculty |
| 9 | `dan-klein.md` | **Dan Klein** *(roster said "Klein")* | The Art & Science of Storytelling | Faculty |
| 10 | `andy-papathanassiou.md` | **Andy Papathanassiou** *(roster said "Pavlos")* | Innovation Mindset: Going Fast (outdoor) | Faculty/Facilitator |
| 11 | `charles-oreilly.md` | Charles O'Reilly | The Challenge of Change / The Ambidextrous Leader | Faculty |
| 12 | `jonathan-levav.md` | Jonathan Levav | Welcome, Fireside Chats, Takeaways, Wrap-Up | Faculty / Host |
| 13 | `darshan-shah.md` | Dr. Darshan Shah | Longevity & Health Optimization | Guest Speaker |
| 14 | `jake-saper.md` | Jake Saper | Fireside Chat (Emergence Capital) | Guest Speaker |
| 15 | `dj-sampath.md` | DJ Sampath | Enterprise AI at Scale (Cisco) | Guest Speaker |
| 16 | `manuel-bronstein.md` | Manuel Bronstein | Building World-Class Products | Guest Speaker |
| 17 | `jamie-siminoff.md` | Jamie Siminoff | Founder of Ring | Guest Speaker |

---

## 🗓️ Schedule at a glance (confirm against final program)

> ⚠️ **Scheduling caveat:** The program has been **revised** since the printed grid (`YPO Grid Draft_5-4-2026.pdf`) — sessions were added (e.g., Lepech, several guest speakers) and times shifted. The day/time in each profile is a best estimate combining the printed grid with your updated roster. **Verify final days/times against the official program** (a few Wednesday/Thursday slots overlap in the source materials).

- **Sun Jun 14** — Program Welcome & Overview (Levav) · Guest Speaker
- **Mon Jun 15** — Living Up to Your Values (Shotts) · Multi-Agent AI Teams (Zou) · AI Applications in Silicon Valley (Brady) · Fireside Chat (Levav host)
- **Tue Jun 16** — AI-Powered Accounting & Finance I/II (deHaan) · Architecting the Mind & Body (Shiv)
- **Wed Jun 17** — The Art of the Possible with Generative AI I/II (Yang) · Geopolitical Implications of the AI Race (Kahl) · Organizational Imperatives for AI Value Capture (Lepech) · Innovation Mindset: Going Fast (Papathanassiou, Koret Plaza, outdoor) · Fireside Chat: Jake Saper (Levav host)
- **Thu Jun 18** — Guest Speaker DJ Sampath (Cisco) · The Art & Science of Storytelling (Klein) · Guest Speaker Manuel Bronstein + Program Takeaways (Levav) · Guest Speaker Jamie Siminoff
- **Fri Jun 19** — The Challenge of Change & The Ambidextrous Leader (O'Reilly) · Program Wrap-Up (Levav)

---

## ✅ Identity corrections made during research

These roster errors were caught and resolved (high confidence) — build agents under the **correct** names:

- **"Joel Shotts" → Kenneth W. Shotts** (Barlow Professor of Political Economy; "Leading with Values").
- **"Sean Brady" → Scott J. Brady** (GSB Lecturer; Managing Partner, Innovation Endeavors).
- **"Pavlos Papathanassiou" → Andy "Papa" Papathanassiou** (NASCAR pit-crew pioneer; Stanford BA/MA). "Pavlos" is an unrelated person.
- **"Klein" → Dan M. Klein** (GSB improv/storytelling lecturer). *Earlier we considered Aaker/Bagdonas/Kluger; confirmed instructor is Dan Klein.*
- Minor factual fixes embedded in profiles: Kahl's undergrad is **Michigan** (not Washington); Levav's PhD is **Duke** (not Cornell); deHaan has **no Duke/Fuqua** appointment.

## ❓ Dropped from the roster

- **Jeffrey Hall / "AI Governance"** — not on your updated roster; that Thursday-8:00 slot is now **DJ Sampath (Cisco)**. A deep-research run on a "Jeffrey Hall / AI Governance" instructor was started but **not** turned into a profile. If the session returns, the research can be retrieved and a profile added.

## ⚠️ Special handling flags for agent builders

- **`darshan-shah.md`** — Shah is both a physician and a commercial wellness entrepreneur. The system prompt includes strict medical guardrails (no diagnosis/prescription; flag evidence levels; note commercial incentives). Keep these.
- **`michael-lepech.md`** — the session's "seven Immediate AI Imperatives" are **not publicly documented**; the seven listed are a clearly-flagged reconstruction. The agent should defer to what Lepech presents in the room.

---

See **`BUILD-GUIDE.md`** for exactly how to turn these files into Relevance.AI agents.
