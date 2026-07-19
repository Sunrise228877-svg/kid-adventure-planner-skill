# Test matrix

## Calendar

- First/last day, cross-month transitions, leap/daylight cases where relevant.
- Current day opens automatically in the configured timezone.
- Weekday labels match dates.
- Travel/rest days contain no reward-bearing tasks.
- Family days remain family days even when an evening class exists.
- Schedule exceptions override repeated rules without duplicate tasks.

## Completion

- Future task cannot start, complete, or makeup.
- Fixed task fails one second before end and succeeds at/after end.
- Timer persists through refresh and device sleep.
- Timer cannot be shortened by a client payload or device-clock edit.
- Makeup only applies to a past eligible task and is visibly labeled.
- Duplicate taps and replayed requests produce one claim and one reward.

## Sync

- Tablet start is visible on phone.
- Tablet claim is visible on phone.
- Action made during an in-flight sync survives the older response.
- Offline action queues and uploads after reconnect.
- Server rejection does not delete valid timer proof.
- Joining with a second device merges without losing accepted history.
- Invalid family code and cross-family reads fail safely.

## Economy and avatar

- XP level boundaries and maximum level.
- Currency balance equals accepted income minus accepted purchases.
- Duplicate/locked/unreleased/unaffordable purchase fails.
- Weekly and hidden unlock requirements match configuration.
- Avatar change preserves claims, XP, currency, and inventory.
- Equipped item must be owned.
- Old state migrates without duplicate refunds or purchases.

## Responsive UI

- iPhone/Android narrow portrait.
- Tablet portrait and landscape in Safari/Chrome equivalents.
- Desktop wide view.
- Full-page scroll, modal scroll, and keyboard focus.
- Clear button states, no text shadows that harm legibility, no clipped dialogs.
- Reduced-motion and sound-off modes.

## Deployment

- Production URL tested from the audience’s ordinary network.
- HTTPS, no exposed secrets, database permissions scoped per family.
- Refresh and deep navigation work in production.
- Rollback artifact/version exists.
