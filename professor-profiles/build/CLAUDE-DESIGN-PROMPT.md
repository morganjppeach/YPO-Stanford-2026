# Claude Design prompt — "Ask the Faculty" (mobile-first, port to Lovable)

Paste the fenced block below into Claude Design. It produces a high-fidelity, **mobile-first**
(responsive to desktop) design + design tokens you can hand to Lovable. It pairs with the engineering
spec in `LOVABLE-PROMPT.md` (which wires the screens to the Relevance AI agents) — keep names, screens,
and tokens consistent between the two.

---

```
ROLE & GOAL
Design a high-fidelity, production-ready UI for a web app called "Ask the Faculty" — a chat product for
YPO member-CEOs attending the YPO × Stanford GSB 2026 Executive Education program. They use it to chat
with AI "study-aid" agents modeled on the program's 17 professors and guest speakers, and apply each
professor's frameworks to their own business problems. Deliver a cohesive visual system and screen
designs I can port to Lovable (React + Vite + Tailwind + shadcn/ui). MOBILE IS THE PRIORITY surface;
the design must also be fully responsive for desktop browsers.

AUDIENCE & TONE
Busy, sophisticated CEOs. The feel should be executive, calm, trustworthy, and premium — closer to a
private members' app or a McKinsey/Stanford product than a consumer chatbot. Confident, uncluttered,
fast. Never gimmicky. These are clearly labeled educational study aids modeled on the faculty — design
should convey credibility and restraint.

PLATFORM PRIORITY
- Design mobile FIRST at 390×844 (iPhone) as the primary frames. Also show 430px (large phone).
- Then provide responsive desktop frames at ≥1024px (and note ≥1440px behavior).
- Touch-first: tap targets ≥44px, thumb-reachable primary actions, bottom navigation on mobile.
- Assume one-handed phone use during/after sessions; also works great on a laptop browser.

THE THREE MODES (core IA)
1. Ask (Concierge) — the hero. One chat that routes any question to the right professor and answers
   grounded in that professor's material. This is the default landing experience.
2. Faculty (1:1) — a directory of the 17 faculty; tap one to chat directly with that professor.
3. Program — a simple, elegant reference page: the program overview and each faculty member mapped to
   their session.

MOBILE NAVIGATION
Bottom tab bar (fixed) with 3–4 tabs: Ask · Faculty · Program (and optionally Saved/History). Clear
active state. Top app bar shows a compact wordmark "Ask the Faculty" with a small co-brand line
"YPO × Stanford GSB Executive Education 2026". Keep chrome minimal so the chat owns the screen.

VISUAL LANGUAGE (give me explicit, Tailwind-mappable tokens)
- Color: primary = Stanford cardinal #8C1515 (used sparingly for primary actions, active states,
  accents); a slightly brighter #B83A4B for hover/active if needed. Neutrals: near-white background
  #FAFAF8 / surface #FFFFFF, hairline borders #E7E5E1, charcoal text #1C1B19, muted text #6B6862.
  Success #2E7D5B, warning/caution amber #B7791F for the health/investing caution lines. Keep it mostly
  neutral with cardinal as the single signature accent. Provide the full token table with hex + a
  Tailwind theme mapping.
- Typography: refined serif for headings/professor names (e.g. "Source Serif 4" or "Lora"); clean sans
  for UI/body ("Inter"). Define a type scale (display, h1–h3, body, small, caption) with sizes/line
  heights for mobile and desktop. Generous line-height for readability of long answers.
- Shape & depth: 12–16px card radius, pill-shaped chips/buttons, soft low shadows (no harsh drop
  shadows), 1px hairline dividers. 8pt spacing system.
- Iconography: a single consistent line-icon set (e.g. Lucide). Each faculty member has a simple
  monogram/emoji avatar token (provided below) — design tasteful circular avatars (initials or emoji on
  a tinted disc), NOT photos of real people (these are AI study aids, not the individuals).
- Imagery: minimal; rely on type, color, and whitespace. Optional subtle cardinal-tinted gradient on the
  Ask hero only.

SCREENS TO DESIGN (mobile frames first, then desktop adaptation for each)
1. Welcome / disclaimer gate (first launch): brief, premium intro card — "Ask the Faculty", one line of
   value, and the required disclaimer (these are AI study aids MODELED ON the faculty, not the real
   people; no individualized medical/legal/investment advice). A single "Enter" CTA. (If gating by
   passcode/email, show a clean single-field entry.) Dismissible; persists to footer afterward.
2. Ask (Concierge) — hero chat:
   - Empty state: warm headline ("What are you working through?"), subtext explaining it routes you to
     the right professor, and 4–5 tappable starter chips (e.g. "My org resists AI adoption — who should
     I learn from?", "Where could AI agents accelerate my R&D?", "Make my board update more compelling",
     "The 80/20 of executive healthspan").
   - Active conversation: user bubbles (right, cardinal-tinted) and agent bubbles (left, white card,
     serif name label + emoji, markdown body). Show which professor the concierge is drawing on as a
     small attribution chip ("Drawing on Prof. Charles O'Reilly"). Sticky composer at the bottom above
     the tab bar with a send button; multiline grows.
   - Show the typing/"thinking" state and a graceful error state.
3. Faculty directory:
   - Search field + optional topic filter chips (AI · Leadership · Product · Finance · Health · Comms ·
     Geopolitics). Responsive grid of faculty cards: avatar, name (serif), session title, one-line
     domain, and a "Chat 1:1" affordance. 1 column on small phones → 2 on large phones → 3–4 on desktop.
4. Professor chat (1:1):
   - Header: back control, avatar, professor name + session, and (for health/investing faculty) a
     one-line amber caution. Body: same chat pattern as Ask, plus that professor's starter-prompt chips
     in the empty state. A subtle "modeled on — not the real person" line near the header.
5. Program:
   - Short program intro, then a clean list/timeline of sessions, each row linking to that professor's
     1:1 chat.
6. Components gallery / style sheet frame: show the token table, type scale, buttons, chips, bubbles,
   card, input, tab bar, toast/error, and the disclaimer banner in one annotated frame.

CHAT CONTENT — DESIGN FOR RICH MARKDOWN
Agent answers are markdown and can be long, with H2/H3 headings, bold, bullet lists, and small tables.
Design the agent bubble to render these cleanly on a 390px screen: comfortable measure, styled headings,
tight-but-legible tables that scroll horizontally if needed, code/quote blocks. Include message actions
(copy, regenerate) and auto-scroll. Use this realistic sample to lay out a long answer:

  "## Where AI agents can accelerate your R&D
   A staged, human-in-the-loop approach works best:
   - **Generate** candidates with a multi-agent team
   - **Filter** computationally before any wet-lab spend
   - **Validate** the top few experimentally
   | Stage | Human oversight |
   |---|---|
   | Generate | Low — set the goal |
   | Validate | High — sign-off gate |
   In the Virtual Lab, 92 candidates → 2 validated binders. Start where a bottleneck is measurable."

STATES & MICROINTERACTIONS
Design: empty, loading/typing (animated dots or shimmer), streaming text arrival, error ("The faculty
member is taking a moment — try again"), long-answer scroll, offline/timeout, and disabled send. Subtle,
fast motion (150–250ms). Respect reduced-motion.

ACCESSIBILITY
WCAG AA contrast on all text (verify cardinal-on-white and white-on-cardinal), visible keyboard focus
rings, ≥44px tap targets, semantic heading order, dynamic-type friendly (scales without breaking),
screen-reader labels for icon-only buttons. Don't rely on color alone for the caution lines.

CONTENT TO POPULATE (use real names/sessions so it looks production-ready; avatars = emoji on tinted disc)
Concierge 🎓 "Ask the Faculty". Faculty:
- 🧬 Prof. James Zou — Multi-Agent AI Teams Accelerating Discovery (AI for science / R&D)
- 🏁 Andy "Papa" Papathanassiou — Innovation Mindset: Going Fast (high-performance teams)
- 🧠 Prof. Baba Shiv — Architecting the Mind & Body for Success (decision neuroscience)
- 🔄 Prof. Charles O'Reilly — The Ambidextrous Leader (org change / success trap)
- 🌐 Dr. Colin Kahl — Geopolitical Implications of the AI Race
- 🎙️ Dan Klein — The Art & Science of Storytelling
- 🧬 Dr. Darshan Shah — Longevity & Health Optimization (health — show caution line)
- 🤖 Prof. Diyi Yang — The Art of the Possible with Generative AI
- 🛡️ DJ Sampath — Enterprise AI at Scale (AI security)
- 📊 Prof. Ed deHaan — AI-Powered Accounting and Finance
- 🚀 Jake Saper — AI-native services / venture (investing — show caution line)
- 🔔 Jamie Siminoff — Founder of Ring (hardware entrepreneurship)
- ⚖️ Prof. Jonathan Levav — Behavioral science & decision-making (program host)
- ⚖️ Prof. Ken Shotts — Living Up to Your Values (values-based leadership)
- 🎮 Manuel Bronstein — Building World-Class Products
- 🏗️ Prof. Michael Lepech — Organizational Imperatives for AI Value Capture
- 🚀 Prof. Scott Brady — AI Applications in Silicon Valley (investing — show caution line)

REQUIRED DISCLAIMER (design it in, on the gate and as a persistent footer/affordance)
"These are AI educational study aids modeled on the named faculty for the YPO × Stanford GSB 2026
program. They are NOT the actual individuals and do not represent them, Stanford, or their employers,
and do not provide individualized medical, legal, or investment advice." Health (Dr. Shah) and investing
(Jake Saper, Scott Brady) chats show an additional one-line caution in the header.

DELIVERABLES (so it ports cleanly to Lovable)
1. A high-fidelity, clickable/interactive design — mobile frames first (390px), then desktop (≥1024px)
   — for all screens above, populated with the real content (no lorem).
2. A one-screen design-system reference: color tokens (hex) with a Tailwind theme mapping, type scale,
   spacing, radius, shadows, and the core components (buttons, chips, chat bubbles, faculty card, input,
   tab bar, disclaimer banner, toast).
3. Build it with web-standard, Tailwind/shadcn-compatible patterns and components so Lovable can
   reproduce it directly. Annotate any spacing/behavior that isn't obvious from the visuals.

CONSTRAINTS
Mobile-first, responsive, accessible, executive/premium, cardinal-as-single-accent. No photos of real
people (emoji/initial avatars only). Keep the disclaimers. Optimize for fast reading of long, structured
answers on a phone.
```

---

## Hand-off tips
- Keep the **token table, screen names, and the 3-mode IA identical** between this design and
  `LOVABLE-PROMPT.md` so Lovable maps the design to the wired components 1:1.
- In Lovable, paste the engineering prompt first (structure + Relevance proxy), then apply this design
  (or import the Claude Design output) so styling lands on a working chat shell.
- The faculty roster, sessions, and disclaimers here match `professor-profiles/agents-manifest.json` —
  if you add faculty later, update both prompts (or regenerate from the manifest).
