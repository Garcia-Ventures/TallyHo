# Release & Deployment Runbook

## 1. Overview

This document describes the procedure for preparing, building, verifying, and releasing **TallyHo** on the **Google Play Store** and **Apple App Store** using **EAS Build** and **GitHub Actions**.

---

## 2. Conventional Commits Standard

To automate changelogs and release notes, all git commits should follow the **Conventional Commits** specification:

- `feat:` or `feat(scope):` — New user-facing feature (maps to **Added** in CHANGELOG.md)
- `fix:` or `fix(scope):` — Bug fixes (maps to **Fixed** in CHANGELOG.md)
- `perf:` or `perf(scope):` — Performance improvements (maps to **Performance** in CHANGELOG.md)
- `docs:` or `docs(scope):` — Documentation changes (maps to **Documentation** in CHANGELOG.md)
- `refactor:` or `style:` — Code refactoring or formatting (maps to **Changed** in CHANGELOG.md)
- `chore:` — Build scripts, tooling, or CI updates (internal)

---

## 3. Step-by-Step Release Workflow

### Step 1: Version Bump & Automatic Changelog

1. Increment version in `package.json` and `app.json`:

   ```bash
   bun run version:bump 1.1.0
   ```

2. Generate changelog section:

   ```bash
   bun run changelog 1.1.0
   ```

3. Verify [`CHANGELOG.md`](../CHANGELOG.md) and [`docs/RELEASE_NOTES.md`](./RELEASE_NOTES.md).

### Step 2: Commit & Create Git Tag

```bash
git add package.json app.json CHANGELOG.md docs/RELEASE_NOTES.md
git commit -m "chore(release): v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
```

### Step 3: Production EAS Build (Automated or Manual)

- **Automated**: Pushing tag `v1.1.0` automatically triggers [`.github/workflows/release.yml`](../.github/workflows/release.yml) to create a GitHub Release and launch EAS production builds.
- **Manual Local**:

  ```bash
  bun run build:android:play
  ```

### Step 4: Internal Testing & Production Submit

1. Download `.aab` output from EAS Dashboard or local `android/app/build/outputs/bundle/release/app-release.aab`.
2. Upload `.aab` to Google Play Console **Internal Testing Track**.
3. Copy user-facing release notes from [`docs/RELEASE_NOTES.md`](./RELEASE_NOTES.md) into Google Play Console "What's New in this Release".
4. Promote build to **Production** track after verification.
