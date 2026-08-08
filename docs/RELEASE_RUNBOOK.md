# Android Release & Deployment Runbook

## 1. Overview

This document describes the step-by-step procedure for preparing, building, verifying, and releasing **Tally Ho** on the **Google Play Store** using **EAS Build** and **GitHub Actions**.

---

## 2. Release Prerequisites

- [ ] All PRs merged into `main` with passing GitHub Actions CI (`.github/workflows/ci.yml`).
- [ ] Working directory clean and verified via `bun run validate`.
- [ ] Expo Organization Account (`@garcia-ventures`) logged in via EAS CLI (`bun x eas login`).
- [ ] Google Play Developer Account access verified.

---

## 3. Step-by-Step Release Workflow

### Step 1: Version Bump

Update version numbers in [`app.json`](file:///Users/engarcia/Development/GVTech/TallyHo/app.json) and [`package.json`](file:///Users/engarcia/Development/GVTech/TallyHo/package.json):

```bash
# Example: Bumping to 1.0.0
npm version 1.0.0 --no-git-tag-version
```

Verify version in `app.json`:

```json
{
  "expo": {
    "version": "1.0.0"
  }
}
```

### Step 2: Commit & Git Tag

Create release tag:

```bash
git add package.json app.json
git commit -m "chore(release): v1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags
```

### Step 3: Trigger Production EAS Build

Execute Android App Bundle production build:

```bash
bun run build:android:play
# Equivalent to: eas build --platform android --profile production
```

### Step 4: Internal Testing Verification

1. Download `.aab` / preview `.apk` output from EAS Dashboard.
2. Upload `.aab` to Google Play Console **Internal Testing Track**.
3. Install build on physical test devices (Pixel / Samsung / Tablet).
4. Execute manual smoke test checklist:
   - [ ] New match setup (Rummy / Uno / Custom)
   - [ ] Score keypad entry for 3 rounds
   - [ ] Leaderboard live update & winner celebration
   - [ ] Theme toggling & persistent settings reset

### Step 5: Submit to Production Track

Promote build from Internal Testing to **Production** track in Google Play Console.
Submit app update for Google Play Policy review.

---

## 4. Rollback & Emergency Recovery

If a critical crash is detected in production:

1. Revert breaking commit on `main`.
2. Increment patch version (e.g. `v1.0.1`).
3. Run `bun run build:android:play`.
4. Upload `v1.0.1` `.aab` directly to Google Play Production track with high-priority release notes.
