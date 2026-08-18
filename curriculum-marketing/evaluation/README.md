# Nomad Consulting — Workshop Evaluation System

**What this is:** the pre/post evaluation instrument every facilitator guide in
both curriculum tracks already instructs facilitators to collect, and which did
not previously exist.

Every one of the 15 facilitator guides lists `evaluation forms or feedback link`
under Materials, and every guide's final slide says *"Collect evaluations before
anyone leaves."* This directory is that instrument.

| File | What it holds |
|------|---------------|
| `README.md` | Design rationale, administration protocol, scoring, reporting, and the limits of what this instrument can claim |
| `FORMS.md` | Full text of Forms A–D, ready to paste into Google Forms or a print template |
| `ITEM-BANK.md` | The module-specific self-efficacy items for all 15 modules |
| `Workshop-Evaluation-Forms.docx` | Print-ready Forms A and B, US Letter, in the house handout format |

The `.docx` is the master print template and is module-agnostic: it carries every
part of Forms A and B that never changes, with two dashed slots marked
`FACILITATOR: paste …` where the module's four items from `ITEM-BANK.md` go. Fill
those two slots, save as the module name, print. Forms C and D live in `FORMS.md`
only — C is emailed, D is for the facilitator.

> **Not visually proofed.** The `.docx` was generated and structurally validated
> (well-formed XML, US Letter, 8 tables, all sections present), but LibreOffice is
> broken in the environment it was built in, so no one has looked at a rendered
> page. Open it once and check the rating grids before you print 24 copies.

---

## 1. Why this design, and not a smiley-face sheet

A satisfaction survey ("Did you enjoy today?") is worth almost nothing
commercially. It cannot support a funder proposal, cannot justify a price
premium, and cannot tell you which module needs revision. This instrument is
built to do three jobs at once:

1. **Prove learning happened** — to the buyer, the funder, and the participant.
2. **Improve the curriculum** — tell the facilitator which section underperformed.
3. **Back the brand claims** — the marketing says *evidence-based* and
   *culturally responsive*. Those claims need measurement or they are assertions.

### The core methodological choice: retrospective pre-post

The obvious design is: rate your skill before, rate it after, subtract. That
design has a well-documented failure mode called **response-shift bias**.

Before a workshop, participants rate themselves against the yardstick they
currently have. A new manager who has never heard of development-level diagnosis
rates herself 4 out of 5 on "matching leadership style" because she doesn't yet
know what the skill involves. Four hours later she understands the skill
properly, applies a harder yardstick, and rates herself 3. Real learning
occurred, and the numbers say she got worse.

The correction, standard in extension education and health-professions training
evaluation, is the **retrospective pre-post** (also called post-then-pre): at the
end of the session, ask participants to rate both *"where I am now"* and *"where
I was before today"* — both on the same, now-informed yardstick.

**This instrument collects both.** Form A takes a true baseline at arrival;
Form B takes the retrospective pre alongside the post. That yields:

- **Retrospective gain** (`post − retrospective pre`) — the headline number, and
  the one to report to funders.
- **Traditional gain** (`post − true pre`) — reported alongside, for transparency.
- **The yardstick shift** (`true pre − retrospective pre`) — how much the session
  changed participants' understanding of the skill itself. A large positive shift
  is evidence the workshop taught something people didn't know they lacked. This
  is a genuinely useful number and almost nobody reports it.

Collecting the true pre also earns its keep in the room: it gives the facilitator
a live read on the group before Section I, which the guides' preparation
checklists already ask for informally.

### Kirkpatrick coverage

| Level | What it measures | Where |
|-------|-----------------|-------|
| 1 — Reaction | Relevance, facilitation, pace, materials | Form B, §3 |
| 2 — Learning | Self-efficacy against the module's four objectives | Forms A + B, §1 |
| 3 — Behavior | Did the committed actions actually happen | Form C (30-day) |
| 4 — Results | Organizational outcomes | Out of scope — see §7 |

### Consistency with what the curriculum itself teaches

Module NM-04, *Program Design and Evaluation*, teaches utilization-focused
evaluation, the outputs-versus-outcomes distinction, and equitable evaluation
principles. Module NM-08 teaches that a listening process without a visible
closed feedback loop *erodes trust faster than not asking at all*.

This instrument is built to those same standards, deliberately:

- **Utilization-focused** — §5 names the primary intended users and uses before
  any item was written.
- **Outcome-oriented** — Form C asks what changed, not how many people attended.
- **Closed loop** — §6 requires sharing results back with participants. If you
  collect Form C and never tell anyone what you learned, you are doing the exact
  thing NM-08 warns against, in a workshop where you charged for the warning.
- **Small-n caution** — §4 sets a minimum group size before reporting any
  disaggregated result, exactly as NM-08's slide 27 instructs.

That coherence is worth saying out loud in a sales conversation: *our evaluation
instrument is built on the principles our evaluation curriculum teaches.*

---

## 2. The four forms

| Form | When | Who | Length | Mode |
|------|------|-----|--------|------|
| **A — Pre-Session** | At arrival, before Slide 2 | Participant | ≤ 4 min | Paper at the seat (preferred) or link |
| **B — Post-Session** | Final 10 min, before anyone leaves | Participant | ≤ 7 min | Paper (preferred) or link |
| **C — 30-Day Follow-Up** | Day 30 (± 3 days) | Participant | ≤ 3 min | Emailed link only |
| **D — Facilitator Debrief** | Same day, within 2 hours | Facilitator | ≤ 5 min | Whatever you'll actually complete |

Form D matters more than it looks. Facilitator memory of which section dragged
decays within a day, and it is the only channel that catches problems
participants can't see — a mistimed run sheet, an activity that needed more
minutes, a slide that consistently confuses the room.

### Paper or digital

**Use paper in the room.** Response rates for an in-room paper form run far
higher than for a link people are asked to open on a phone at the end of a
four-hour session. The facilitator guides already say "collect evaluations
before anyone leaves" — that instruction only works on paper.

Use the digital link for **Form C only**, where there's no room to collect in.

If a client requires digital in-room (some corporate L&D will), build Forms A
and B in Google Forms from `FORMS.md`, and budget five minutes of session time,
not two.

---

## 3. Anonymous linking — how to match forms without names

Pre, post, and follow-up have to be linkable per person, or you cannot compute
gain. Names suppress honesty, especially on the cultural-responsiveness items
where you most need candor.

Use a **self-generated identification code**. Each participant builds the same
code on all three forms from facts they will reproduce identically months apart:

> **Your code:** first two letters of the month you were born + the last two
> digits of your phone number + the first two letters of the city you were born in.
>
> *Example: born in March, phone ending 47, born in Memphis → `MA47ME`*

Print the instruction on all three forms, identically. Expect roughly 5–15% of
codes not to match across forms; that's normal attrition, not a broken design.
Report matched-pair counts honestly rather than quietly dropping unmatched
records without saying so.

Do **not** use last-four-of-SSN, employee ID, or date of birth. The first is a
real security problem, and all three defeat the anonymity you're trying to buy.

---

## 4. Scoring

### Scale

All self-efficacy and reaction items use a **1–5 scale**, matching the 1–5
self-rating already used in the EI Snapshot handout so participants meet a
consistent convention across your materials.

```
1 = Not at all    2 = A little    3 = Somewhat    4 = Well    5 = Very well
```

The single "would you recommend" item uses 0–10, because that's the convention
buyers recognize.

### The numbers to compute

For each of the four module objectives, and for the 4-item mean:

| Statistic | Formula | Use |
|-----------|---------|-----|
| Retrospective gain | `mean(post) − mean(retro pre)` | Headline. Report this. |
| Traditional gain | `mean(post) − mean(true pre)` | Report alongside, for transparency |
| Yardstick shift | `mean(true pre) − mean(retro pre)` | Evidence the session reframed the skill |
| % improving | share of matched participants with post > retro pre on the 4-item mean | The most intuitive number for a non-technical buyer |
| Commitment completion | from Form C | The Level 3 number funders actually want |

### Reporting rules — hold these

- **Minimum n = 5** for any reported mean. Below that, report the raw responses
  or say nothing.
- **Minimum subgroup n = 10** before reporting any disaggregated result (by role,
  org, tenure, or any demographic). This is NM-08's own small-n caution applied
  to your own data. Below 10, disaggregation both compromises anonymity and
  produces unreliable conclusions.
- **Never report a gain as a percentage improvement.** A move from 2.5 to 3.8 on
  a 5-point scale is a gain of 1.3 scale points, not "a 52% improvement in
  leadership capability." The second phrasing is not defensible and a sophisticated
  program officer will notice.
- **Report response rate every time.** A 4.7 mean from 6 of 22 participants is
  not the same finding as a 4.3 from 21 of 22, and the difference matters.

### No knowledge test — deliberate

This instrument uses self-efficacy items, not a graded knowledge quiz, as the
Level 2 measure. That is a considered choice: a post-test at the end of a
four-hour session depresses response rates, sours the closing, and measures
recall rather than the applied capability these workshops are actually built for.

The exception is accreditation. If you pursue SHRM or CFRE approval (see
`../GO-TO-MARKET.md`, item P12), the awarding body may require a scored
post-test. Build those only for the modules you're accrediting, and keep them
separate from this instrument rather than bolting them onto Form B.

---

## 5. Primary intended users and uses

Named first, per utilization-focused practice. Every item in `FORMS.md` earns its
place by serving at least one of these; items that served none were cut.

| User | Use | Fed by |
|------|-----|--------|
| **The facilitator** | Revise the run sheet and activities before the next delivery | Form B §3–4, Form D |
| **The buyer** (ED, L&D lead, board chair) | Justify the spend, decide whether to book more | Form B §1–3, Form C |
| **The funder** (in a cohort contract) | Report grantee capacity outcomes | Form B §1, Form C — the §6 report |
| **Nomad Consulting** | Price, position, and prove the two brand claims | Everything, in aggregate across deliveries |
| **The participant** | See their own change; be reminded of their commitments | Form C, plus the §6 share-back |

---

## 6. Closing the loop — required, not optional

Within **10 working days** of a delivery, send every participant a short summary:
what the group reported, what you're changing as a result, and a reminder of the
commitments they wrote. This is the practice NM-08 teaches; skipping it while
selling that module is indefensible.

It also roughly doubles Form C response rates, because participants who have
heard from you once expect the follow-up and know it goes somewhere.

### One-page funder / buyer report — structure

1. **What was delivered** — module, date, contact hours, participants (registered
   vs. attended)
2. **Who attended** — role and organization mix, no individuals named
3. **What changed** — the 4-item retrospective gain, % improving, response rate,
   matched-pair count
4. **What participants committed to** — the three most common commitment themes,
   verbatim where permission was given
5. **What actually happened at 30 days** — commitment completion rate, one or two
   concrete examples
6. **What we're changing** — the honest one. Naming a weak section and your fix
   builds more credibility with a program officer than a clean sheet does.

Never send a report without §6. A report with no criticism in it reads as
marketing, and program officers read a great many of those.

---

## 7. What this instrument cannot tell you

State these limits before a buyer discovers them. Naming them is the same
credibility move the curriculum itself makes when it flags thin evidence behind
SLII, GROW, Kotter, and the Eisenhower matrix.

- **These are self-reports.** Self-rated capability is not observed behavior. The
  EI module's own slide 8 makes exactly this point — roughly 95% of people believe
  they are self-aware while multi-rater studies put it near 10–15%. Form C's
  commitment-completion item is the closest this instrument gets to behavioral
  evidence, and it is still self-reported.
- **There is no control group.** You cannot claim the workshop *caused* the change.
  Say "participants reported," not "the workshop produced."
- **No Level 4 results.** Retention, turnover, funds raised, and audit findings
  are not measured here. A cohort contract with a 6–12 month horizon and access to
  organizational data could reach Level 4; a half-day cannot, and claiming it would
  be caught.
- **Retrospective pre has its own bias.** It corrects response shift but is
  vulnerable to participants under-rating their past selves to be agreeable. That
  is precisely why both pre measures are collected and both reported.
- **No benchmarks yet.** You have no baseline. Do not publish targets or
  comparative claims until you have run this across at least 5 deliveries and
  roughly 60 matched pairs. Until then, report your own numbers plainly and
  describe them as early data.

---

## 8. Rollout

1. Build Forms A and B as a print template; build Form C in Google Forms.
2. Pick the module and paste its four items from `ITEM-BANK.md` into §1 of both
   Forms A and B.
3. Run it on the two pilot deliveries in `../GO-TO-MARKET.md` (Days 15–30). Treat
   the first two as a test of the instrument as much as of the workshop.
4. After delivery two, cut any item that produced no variance — if everyone
   answers 5, the item is measuring nothing.
5. Add the evaluation link and the 30-day follow-up to every proposal from then
   on. It is a differentiator; most competitors send a satisfaction sheet.
6. Set up a single spreadsheet, one row per matched participant per delivery,
   from the first pilot. Retrofitting this later across scattered paper forms is
   miserable, and the cross-delivery aggregate is what eventually supports pricing
   and positioning claims.
