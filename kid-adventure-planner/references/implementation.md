# Implementation guidance

## Layer the application

Use four independent layers:

1. `planner-config`: dates, tasks, copy, rewards, shop, avatar stages.
2. `theme-config`: colors, typography, surfaces, icons, motion, sound mapping.
3. `game-state`: claims, timers, purchases, avatar/equipment choices, schema version.
4. `sync-service`: authentication, policy validation, durable storage, merge response.

Do not encode schedule facts in JSX/CSS or visual theme choices in business logic.

## Stable task policy

Build a server-side map from stable task ID to:

- date and timezone;
- completion kind;
- scheduled end or timer duration/not-before time;
- XP and currency reward;
- makeup eligibility.

Reject unknown IDs. Ignore client-supplied rewards, prices, durations, release dates, and levels. Generate both the client display policy and server validation policy from one shared configuration module; do not maintain two hand-copied rule tables that can drift.

## Reliable timer flow

1. Client checks obvious eligibility.
2. Client stores `startedAtMs` locally and immediately submits it.
3. Server validates same-day, not-before time, acceptable clock skew, and configured duration.
4. Client restores countdown from the persisted timestamp after refresh.
5. On claim, client sends the claim while retaining timer proof.
6. Server accepts only when its time reaches readiness.
7. Client removes timer proof only after the authoritative response contains the claim.

Never restart a valid timer at the first sync. Never trust a client-supplied `durationMs`.

## Safe sync queue

Maintain:

- a current state reference;
- one request-in-flight flag;
- a pending-sync flag or explicit operation queue;
- a snapshot of what was sent.

When a response arrives, retain operations that were created after the sent snapshot. If pending work exists, send again immediately. Merge accepted claims and purchases by ID. Do not use last-writer-wins for reward-bearing records.

When a second device joins, ask whether to merge its existing local records, use the cloud state, or cancel. Never surprise the family by silently discarding either side.

## Idempotency

Use the task ID as the claim idempotency key and item ID as the one-time purchase key. The server checks existing records before changing balances. Replayed requests return the same accepted state without minting rewards again.

## State migrations

Version runtime state separately from planner configuration. For each schema or economy change:

- read prior versions;
- map old item/task IDs explicitly;
- preserve accepted historical claims;
- recompute derived totals;
- validate purchases in chronological order;
- test migration twice to prove idempotence.

## Accessibility and feedback

- Keep text readable over themed backgrounds.
- Make touch targets at least 44 CSS pixels.
- Announce timer and reward status in text, not sound alone.
- Respect reduced-motion and sound-off preferences.
- Use short audio/haptic feedback only after user interaction.
- Keep document scrolling and modal scrolling independent and tested.
