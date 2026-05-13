# Project B: Billing & Misc Bug Notes

## Pre-existing concerns (do not fix in Phase 9 reskin tasks)

- **`luxon` in `LeaderboardSection/index.tsx`**: The component imports `Duration` from `luxon` for time formatting (`Duration.fromMillis(score.time).rescale().toFormat("m:s.SSS")`). The task spec mentioned this may have been migrated to Temporal already — it has not. `luxon` is still in use as of Task 34. If `luxon` is not in `package.json` or is being removed, this will break. Fix in a dedicated cleanup task.
