---
name: kid-adventure-planner
description: Build or revise a personalized child holiday schedule as a responsive, gamified web app with requirement interviews, daily and weekly views, child-friendly task copy, time-locked completion, timers, makeup records, XP progression, redeemable currency, avatar growth, optional family-device sync, tests, and deployment. Use when a parent asks for a summer planner, study-and-sports calendar, child habit adventure, reward calendar, or a similar family schedule app. Keep visual themes user-defined and do not bundle third-party game or character assets.
---

# Kid Adventure Planner

Turn family schedules into a child-friendly adventure calendar that is pleasant to use and hard to exploit accidentally. Separate product rules, schedule data, theme assets, and runtime state so later timetable or style changes stay safe.

## Choose the delivery tier

Decide with the user before implementation:

1. **Plan only**: produce a conflict-checked written schedule.
2. **Single-device app**: add responsive views, timers, rewards, and local persistence.
3. **Family-sync app**: add a server-authoritative sync API and durable storage.

Do not imply that browser storage syncs across devices. Do not implement cloud synchronization until a backend and private family identity are available.

## Follow the gated workflow

### 1. Interview before coding

Read `references/intake.md`. Ingest screenshots and chat records when provided. Extract facts, flag conflicts, and ask one consequential question at a time. Never infer fixed course times, travel dates, reward eligibility, or family-day rules.

Confirm at minimum:

- child nickname, age band, timezone, and holiday dates;
- fixed classes with exact start/end times;
- flexible activities and minimum durations;
- travel, rest, and family days;
- weekday/weekend rhythm;
- theme direction and prohibited elements;
- whether timers, makeup, rewards, avatars, and sync are required.

### 2. Freeze a written plan

Produce two artifacts before UI work:

- a rule table covering repeated weekly rules and exceptions;
- a complete date-by-date calendar.

Require explicit confirmation. Then encode the plan using `references/data-contract.md`. Keep stable task IDs after release so schedule edits do not erase history.

Run:

```bash
node scripts/validate-plan.mjs path/to/planner-config.json
```

Fix every error before implementation. Treat warnings as decisions that need review, not noise.

### 3. Add child-friendly copy

Write one short, distinct sentence for every task instance. For learning, use an inviting entry cue or explain what skill it strengthens; avoid making every activity a “challenge.” For sport, concrete skill goals may feel playful. For AI creation, propose a small build and someone to test it. Match the child’s age without sounding babyish.

### 4. Build the usable core first

Implement in this order:

1. welcome screen and automatic current-day selection;
2. day view, week view, date navigation, and clear period sections;
3. responsive phone/tablet/desktop layout with reliable document and modal scrolling;
4. schedule data isolated from components and theme tokens;
5. local persistence and versioned state migration;
6. completion rules and timers;
7. XP, currency, shop, avatar progression, and feedback;
8. family sync when selected.

Keep the visual layer replaceable. Ask the user to define the theme, then create a tokenized theme configuration. Use original, licensed, public-domain, or user-supplied assets. Never package proprietary textures, characters, logos, music, or sound effects in this skill.

### 5. Enforce completion on the server when sync exists

Read `references/product-rules.md` and `references/implementation.md` before implementing completion or sync.

Preserve these invariants:

- future tasks are locked;
- fixed classes unlock only after the scheduled end;
- timed tasks unlock only after the required elapsed time;
- rest, travel, and family-only entries never mint rewards;
- past tasks may be marked as makeup only when policy allows;
- each task claim and purchase is idempotent;
- XP only changes level; currency only buys items;
- the server recomputes rewards, prices, unlocks, and time eligibility;
- a client never sends trusted reward values or trusted elapsed duration;
- timer proof remains until the server confirms the claim;
- operations created during an in-flight sync remain queued;
- merging is record-based, never a blind whole-state overwrite.

Use a press-and-hold or parent-confirmed action for reward claims when accidental taps are a concern. Do not pretend it proves that a child completed offline work; it is a deliberate family confirmation, not surveillance.

### 6. Balance progression before polishing

Calculate theoretical XP, currency income, and shop cost across the full calendar. Ensure an ordinary week can earn at least one weekly item with a small surplus. Keep hidden items meaningfully more expensive and conditionally unlocked. Define every avatar level before coding it, and make changing the base avatar preserve progress and inventory.

Run the validator again whenever schedule rewards or shop prices change.

### 7. Test real family failure modes

Use the matrix in `references/testing.md`. At minimum verify:

- current, future, past, travel, family, and cross-month dates;
- refresh during a timer and claim immediately after readiness;
- duplicate taps and duplicate network requests;
- offline action followed by reconnect;
- tablet action visible on phone;
- timezone and midnight boundaries;
- insufficient funds, repeated purchase, level-up, avatar change, and makeup;
- scrolling and modals on phone and tablet, portrait and landscape;
- state migration after a schedule or economy update.

For every fixed defect, add a regression test that reproduces the original failure.

### 8. Deploy for the audience

Use a stable production host, HTTPS, environment-held secrets, and durable storage for sync. Test the final URL from the audience’s actual network without relying on the developer’s VPN or cached session. A preview URL is not a distribution plan.

For mainland-China audiences, separate “generate the project” from “host the project.” Choose a mainland-accessible deployment path and test it on an ordinary mobile network. Keep a rollback version.

## Modify an existing planner safely

Preserve historical claims and purchases. Change the smallest layer possible:

- timetable changes -> schedule data;
- reward rebalance -> economy config plus migration;
- visual change -> theme tokens/assets;
- logic defect -> runtime/server code plus regression tests.

Never regenerate identifiers for already-released tasks. If state shape changes, add an explicit migration and test both old and new records.

## Resource map

- `references/intake.md`: requirement interview and plan acceptance gates.
- `references/data-contract.md`: neutral configuration contract and stable IDs.
- `references/product-rules.md`: completion, reward, progression, and sync invariants.
- `references/implementation.md`: recommended architecture and merge algorithms.
- `references/testing.md`: end-to-end and regression matrix.
- `scripts/validate-plan.mjs`: deterministic schedule and economy audit.
