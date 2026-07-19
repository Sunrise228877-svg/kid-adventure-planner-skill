# Product rules

## Time and completion

- Calculate all calendar decisions in the configured timezone.
- Lock future dates completely.
- Unlock fixed tasks only after their scheduled end.
- Start timed tasks no earlier than their policy allows; store the start immediately.
- Derive readiness as `trustedStart + trustedDuration`.
- Allow makeup only for past eligible tasks and mark it explicitly.
- Exclude travel, rest, family-only, and informational entries from rewards.
- Treat reward confirmation as an intentional family record, not proof of physical activity.

## Rewards and economy

- Derive XP and currency from the trusted task policy.
- Use XP only for levels and avatar stages.
- Use currency only for purchases.
- Process a claim or purchase once by stable ID even if the request repeats.
- Recompute balances from accepted claims minus accepted purchases.
- Reject unreleased, locked, duplicate, or unaffordable items on the server.
- Balance each normal week so expected completion can buy at least one weekly item with a modest surplus.
- Keep hidden items roughly twice a regular item unless the user chooses another tested economy.

## Avatar progression

- Let the child select a base avatar without changing XP, currency, claims, or purchases.
- Define one stage for every level, with stronger visual changes at milestone levels.
- Show current avatar, level, progress, and equipped collectible on the main view.
- Keep avatar and equipment selections timestamped for deterministic multi-device merging.

## Sync and authority

- Use an unguessable family identifier; hash it before storage when practical.
- Keep secrets and administrator credentials server-side.
- Make the server authoritative for time, task policy, claims, purchase cost, and unlocks.
- Persist local operations before sending them.
- Queue operations created during an in-flight request.
- Keep timer proof until the accepted claim returns from the server.
- Merge claims and purchases as monotonic sets keyed by stable ID.
- Resolve avatar/equipment preferences with a server-validated timestamp or revision.
- Never replace the whole local state with an older response.

## Privacy

- Prefer nickname over full legal name.
- Exclude school, class, address, teacher contact details, and precise venue data from public pages.
- Use fictitious data for demos.
- Set private family planners to `noindex`.
- Do not expose one family’s records to another family code.

## Asset policy

- Keep third-party IP out of the reusable Skill and public starter.
- Accept original, licensed, public-domain, or user-supplied assets.
- A disclaimer does not grant permission to redistribute protected textures, characters, logos, music, or sound effects.
