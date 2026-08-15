# How-To Guide: Release & Deployment Workflow

This guide details the procedure for bumping semantic versions, generating changelogs, and executing automated cloud builds with **EAS Build** and **GitHub Actions**.

---

## 1. Conventional Commits Standard

All commit messages should follow the **Conventional Commits** format to allow automated changelog compilation:

- `feat:` or `feat(scope):` — User-facing feature (Mapped to **Added**)
- `fix:` or `fix(scope):` — Bug fix (Mapped to **Fixed**)
- `perf:` or `perf(scope):` — Performance improvement (Mapped to **Performance**)
- `refactor:` or `style:` — Code refactoring or styling (Mapped to **Changed**)
- `docs:` — Documentation updates (Mapped to **Documentation**)
- `chore:` — Tooling or build scripts

---

## 2. Release Steps

### Step 1: Version Bump

Synchronize semantic versioning across `package.json` and `app.json`:

```bash
# Automated semantic bump
bun run version:patch # e.g., 1.0.2 -> 1.0.3
# or
bun run version:minor # e.g., 1.0.2 -> 1.1.0
# or explicit version
bun run version:bump 1.1.0
```

### Step 2: Generate Release Notes & Changelog

```bash
bun run changelog
```

Inspect and verify [`CHANGELOG.md`](../../CHANGELOG.md) and [`docs/RELEASE_NOTES.md`](../RELEASE_NOTES.md).

### Step 3: Run Full Validation

```bash
bun run validate
```

### Step 4: Commit and Push Git Tag

```bash
git add package.json app.json CHANGELOG.md docs/RELEASE_NOTES.md
git commit -m "chore(release): v1.0.3"
git tag -a v1.0.3 -m "Release v1.0.3"
git push origin main --tags
```

---

## 3. Automated EAS Cloud Builds

Pushing a tag `v*.*.*` automatically triggers [`.github/workflows/release.yml`](../../.github/workflows/release.yml) to:

1. Validate the codebase.
2. Publish a GitHub Release with compiled release notes.
3. Trigger an EAS production Android `.aab` build with automatic submission to the Google Play Internal track.

### Manual EAS Trigger Commands

If you prefer running builds directly from your terminal:

```bash
# Android Production App Bundle (Auto-submitted to Google Play)
bun run build:android:play

# Android Preview APK (for direct sideload testing)
bun run build:android:apk

# iOS Preview Build (Internal distribution)
bun run build:ios:device
```
