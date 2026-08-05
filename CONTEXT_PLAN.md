# Context plan

How we set up context for this repo, following Anthropic's "new rules of
context engineering for Claude 5 models" (Thariq, Jul 24). This is a migration
plan, not permanent guidance. Once it is executed it can be deleted.

## What the article actually changes

Five shifts matter for us:

1. **Rules to judgement.** Blanket rules ("never write comments") were
   guardrails for weaker models. They now cause conflicts that cost reasoning.
   Delete them; keep only rules that are true in every case.
2. **Everything upfront to progressive disclosure.** A CLAUDE.md should not be
   the place every practice goes to live. Build a tree of files loaded when
   relevant.
3. **Descriptions to references.** Code, mockups, and test suites are
   higher-fidelity specs than prose. An HTML mockup beats a paragraph.
4. **Repetition to single placement.** Say a thing once, in the place it is
   needed.
5. **Don't state the obvious.** Anything readable from the file system is
   wasted tokens. Spend them on gotchas instead.

## Where we stand today

| | Current | Target |
|---|---|---|
| Always-loaded context (`CLAUDE.md` files) | 226 lines | ~100 lines |
| Skills | 0 | 3 |
| `.claude/` config | none | skills + settings |
| Verification story | none for `lodestar/` | one skill |
| Rubrics | prose rules in CLAUDE.md | one voice rubric |

The headline: **all our guidance is always-on, and none of it is on demand.**
That is precisely the shape the article says to move away from. We are not
over-ruled so much as under-structured.

One live inaccuracy to fix while we are in there: root `CLAUDE.md` says the
repo holds "four independent projects" and lists four, but
`nomad-ad-generator/` also exists and is undocumented.

---

## Phase 1: Rightsize the two CLAUDE.md files

**`CLAUDE.md` (root, 32 lines).** Already close to the article's ideal: it says
what the repo is and where the boundaries are. Only change is accuracy, adding
`nomad-ad-generator/` and correcting the project count.

**`lodestar/CLAUDE.md` (194 lines).** Target ~70. Specifically:

- **Cut the repo structure tree** (~54 lines, 28% of the file). It is an
  annotated `ls`. Keep only the entries that are genuinely non-obvious: that
  `.web.js` variants exist alongside native modules, and that
  `_shared/vegaTiers.json` is imported by both the app and the nudge function.
  Those are gotchas. The rest is filesystem.
- **Cut "Setup / deploy order"** and point at `DEPLOY.md`, which already owns it
  in 316 lines. Two sources for one procedure is the repetition the article
  says to remove.
- **Cut "Current state"** (~32 lines). It is a changelog, and the standing
  instruction to update it after every feature is a maintenance tax that
  regenerates the bloat we are removing. Git history is the changelog.
- **Trim the data model** to the RPC names and cron cadence. Those are not
  guessable. Table column lists are readable from the 17 migrations.
- **Keep in full**: "Hard rules" and the Vega character section. Hard rules are
  the rare case where a blanket rule is correct in every case (the crisis
  guardrail, the API key boundary, RLS scoping). The Vega section encodes taste
  that cannot be inferred from code.

Net effect: what survives is the stuff I would get wrong without being told.

## Phase 2: Build the skill tree

Create `.claude/skills/`. Three skills, in priority order:

1. **`lodestar-verify`** (highest value, does not exist in any form today).
   `lodestar/` has no tests and no lint gate, so today "does it work" is a
   manual conversation every time. The skill defines what verification means
   per surface: `web/` gets `next build` and `next lint`; `app/` gets an Expo
   start check; `supabase/` gets a migration dry run. This is the article's own
   canonical example of what to pull out of a system prompt.
2. **`lodestar-deploy`** wraps `DEPLOY.md` so 316 lines load when we are
   deploying and never otherwise.
3. **`vega-voice`** as a rubric. Today "no em dashes", "loving, never
   punishing", "preserve the two-beat meltdown", and "mechanism, not magic"
   live as prose rules. As a rubric they become checkable, and can drive a
   verifier pass over any user-facing copy before it ships. This is the one
   place your taste is load-bearing and unguessable, so it earns the structure.

Not building skills for `Celestial/`, `kalshi-tool/`, or
`nomad-ad-generator/` yet. Build them when we actually work in them.

## Phase 3: Prefer references to descriptions

- When you want a UI change, point me at a mockup or at the existing screen
  file rather than describing the result. You already do this well once:
  `VegaOnboarding.jsx` sits in the repo as a reference prototype for the intake
  flow. That pattern generalizes.
- Move the brand palette out of prose. Six hex codes currently live as text in
  `lodestar/CLAUDE.md` and are re-typed into app and web code. One tokens file
  imported by both is a reference instead of a description, and it stops the
  values drifting.

## Phase 4: How we work together

This is the half the article implies but does not spell out.

**What changes on my side:**

- Fewer clarifying questions. I make the routine call, state the assumption,
  and keep going. I ask only when two readings produce materially different
  work.
- No intermediate plan or analysis documents unless you ask for one.
- Match the style of surrounding code rather than applying a blanket comment or
  docstring rule.
- Load the relevant skill instead of asking you to re-explain a procedure.

**What helps most from your side:**

- Point at a file or mockup instead of describing it. Highest leverage change
  available.
- Give me the goal and the constraint, not the steps. The steps are the part I
  am good at; the constraint is the part I cannot see.
- Flag when a decision is taste versus mechanical. On taste I will ask. On
  mechanical I will decide and tell you what I decided.
- **Resist adding a rule after a one-off mistake.** This is how a 194-line
  brief happens. Add a rule only when the mistake recurs, and put it where it
  loads on demand rather than at the top of every conversation.

## Phase 5: Keep it from growing back

- The article ships a `/doctor` command intended to rightsize skills and
  CLAUDE.md files automatically. Worth running locally after Phases 1 and 2 to
  see what it flags.
- Default to deleting. If a line in a CLAUDE.md has not changed an outcome in
  months, it is costing tokens and adding conflict surface for nothing.

## What we are deliberately not doing

- **Not converting the Vega character section into a skill.** It is short and
  relevant to nearly every Lodestar task, so on-demand loading would cost more
  than it saves. Progressive disclosure is for the rarely-needed.
- **Not adding usage examples** to skills. The article is explicit that
  examples now constrain the model's exploration space. Design the interface
  well instead.
- **Not touching memory.** Auto-memory replaced the `#` hotkey workflow and
  needs no setup from us.

## Sequencing

Phase 1 is an hour and pays immediately. Phase 2 is the real work and can go
one skill at a time, starting with `lodestar-verify`. Phases 3 through 5 are
habits rather than tasks, and start whenever you want.
