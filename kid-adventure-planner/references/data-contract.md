# Planner configuration contract

Store the user-owned content in a neutral JSON configuration. The validator accepts the following shape.

```json
{
  "version": 1,
  "meta": {
    "title": "Summer Adventure",
    "childNickname": "Explorer",
    "timezone": "Asia/Shanghai",
    "startDate": "2026-07-13",
    "endDate": "2026-08-30"
  },
  "calendar": [
    {
      "date": "2026-07-13",
      "dayType": "normal",
      "tasks": [
        {
          "id": "2026-07-13:morning:english",
          "title": "English",
          "period": "morning",
          "kind": "fixed",
          "start": "09:00",
          "end": "09:25",
          "reward": { "xp": 10, "currency": 3 },
          "copy": "Collect one new phrase for your next conversation."
        }
      ]
    }
  ],
  "economy": {
    "xpPerLevel": 200,
    "maxLevel": 10,
    "weeklyItems": [
      { "id": "week-1-item-a", "week": 1, "name": "Explorer Cape", "cost": 30 }
    ],
    "hiddenItems": [
      { "id": "secret-a", "name": "Aurora Crown", "cost": 60, "minLevel": 4, "minOwned": 2 }
    ]
  },
  "avatars": [
    { "id": "builder", "name": "Builder" },
    { "id": "pilot", "name": "Pilot" }
  ],
  "avatarStages": [
    { "level": 1, "title": "New Explorer", "visual": "base outfit" },
    { "level": 2, "title": "Trail Finder", "visual": "small accessory" }
  ]
}
```

## Required invariants

- `meta.timezone` must be an IANA timezone.
- `calendar` must contain each date in the inclusive range exactly once.
- `dayType` is `normal`, `family`, `travel`, or `rest`.
- A task ID is stable, unique, deterministic, and never reused for a different task.
- `kind` is `fixed`, `timer`, `optional`, or `info`.
- A fixed task has `start` and `end`; a timer task has positive `durationMinutes`.
- Informational tasks and all tasks on travel/rest/family days have zero reward.
- `period` is `morning`, `afternoon`, or `evening`.
- Child-facing `copy` is short, distinct, and concrete.
- XP and currency are non-negative integers supplied by configuration but recomputed by the server from the task policy.
- Shop item IDs and avatar IDs are unique.
- Every visible level has an avatar stage.

## Runtime records

Keep runtime state out of this file:

```ts
type Claim = {
  taskId: string;
  claimedAtMs: number;
  mode: "same-day" | "makeup";
};

type Timer = {
  taskId: string;
  startedAtMs: number;
  readyAtMs: number;
};

type Purchase = {
  itemId: string;
  purchasedAtMs: number;
};
```

The server derives reward values, duration, date, price, and unlock rules from trusted configuration rather than accepting them from these records.
