# Weekly Release Train (Quota-Safe)

Free plan: **15 Android + 15 iOS builds/mo**, resets on the 1st, low-priority queue.
Goal: **~4-5 cloud builds/mo** with buffer for hotfixes.

## Decision tree

1. **JS-only change?** (`src/`, `app/`, assets, styles)
   → OTA only, 0 builds: `bun run update:production -- --message "fix: <notes>"`
2. **Native change?** (detected by `scripts/fingerprint-diff.mjs`: Expo fingerprint
   hash of HEAD vs last tag — catches config/plugin/dep changes the path filter
   would miss; `package.json`/`bun.lock` changes short-circuit to rebuild)
   → waits for Tuesday 14:00 UTC train (`release-train.yml`), max 1 gated build.
3. **Need store submission without rebuild?**
   → `bun run submit:android:latest` (`eas submit --latest`, 0 builds).
4. **Quota hit?**
   → `bun run build:android:local:submit` (0 cloud builds) or wait for reset.
   → iOS local: `eas build --platform ios --profile production --local` (requires Mac + Xcode).

## Workflows

| Workflow            | Trigger                | What it does                                                                                                                                            |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `release.yml`       | push to `main`         | `release-please` versions + changelog only. No cloud build unless manual dispatch with `enable_cloud_build=true` (+ `production` environment approval). |
| `release-train.yml` | Tue 14:00 UTC + manual | `validate` → detect native changes → OTA `production` → gated cloud build (native-only) → summary. `dry_run=true` reports without side effects.         |
| `ci.yml`            | PR/push                | validation only, never builds.                                                                                                                          |

OTA channels map to build profiles via `eas.json: channel` (`development`/`preview`/`production`) and `app.json: runtimeVersion.policy=appVersion` — OTA only applies to matching binaries.

## Quota observability

Every train runs a `quota-check` job (`scripts/eas-quota.mjs`) that counts this
month's cloud builds via `eas build:list` and posts a badge to the run summary:

- `ok` (>5 left per platform) → train proceeds normally.
- `warning` (≤5 left) → prefer OTA and `--local` builds until the 1st.
- `exhausted` (0 left) → `cloud-build` is skipped automatically; a fail-closed
  `--fail-on-exhausted` re-check runs at build time in case usage changed mid-train.

Telemetry is fail-open: if `eas build:list` is unreachable, the gate is skipped
(`request_ok=true`, status `unknown`) so a monitoring outage never blocks a
release — check Billing → Usage manually in that case. Override budgets for paid
plans: `node ./scripts/eas-quota.mjs --budget-android 30 --budget-ios 30`.

## Manual commands

```bash
bun run quota:check
bun run quota:status      # live usage vs monthly budget (15/15 Free)
bun run fingerprint:check # fingerprint HEAD vs last tag (JSON, no side effects)
bun run update:preview -- --message "preview <notes>"
bun run update:production -- --message "v1.3.2 hotfix"
bun run build:android:local:apk    # preview APK, no quota
bun run build:android:local:submit # production AAB + submit, no quota
```

## Before enabling the train

- Set `EXPO_TOKEN` in repo secrets.
- Approve the `production` environment once (required reviewer recommended).
- Watch Billing → Usage after first 1-2 trains; adjust day/time if queue is slow (avoid NA midday peak).
