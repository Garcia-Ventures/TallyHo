# How-To Guide: Release & Deployment Workflow

This guide details the procedure for automated semantic versioning, changelog management, GitHub releases with **Google `release-please`**, and cloud deployments via **EAS Build & Submit**.

---

## 1. Conventional Commits Standard

All commit messages must follow the **Conventional Commits** format. Google `release-please` monitors conventional commits on `main` to determine the next semantic release tier and compile [`CHANGELOG.md`](../../CHANGELOG.md):

- `feat:` or `feat(scope):` — User-facing feature (**Minor** version bump: `1.0.3` -> `1.1.0`)
- `fix:` or `fix(scope):` — Bug fix (**Patch** version bump: `1.0.3` -> `1.0.4`)
- `feat!:` or `fix!:` or `BREAKING CHANGE:` — Breaking change (**Major** version bump: `1.0.3` -> `2.0.0`)
- `perf:` — Performance improvement (Included in Changelog)
- `refactor:` or `style:` — Code refactoring or styling (Included in Changelog)
- `docs:` — Documentation updates (Included in Changelog)
- `chore:` — Tooling or dependency updates

---

## 2. Automated Release Workflow (Google `release-please`)

The continuous delivery pipeline is fully automated via [`.github/workflows/release.yml`](../../.github/workflows/release.yml):

1. **Commit & Push to `main`**:
   - Push conventional commits to `main` (or merge feature branches into `main`).
2. **Automated Release PR**:
   - Google `release-please` automatically maintains an open Release Pull Request titled e.g. `chore(main): release 1.1.0`.
   - The PR automatically updates [`CHANGELOG.md`](../../CHANGELOG.md), [`package.json`](../../package.json), and [`app.json`](../../app.json) (`$.expo.version`).
3. **Merge the Release PR**:
   - Merging the Release PR automatically tags the repository (e.g. `v1.1.0`) and publishes the GitHub Release.
4. **Automated EAS Store Build & Submit**:
   - Upon release creation, GitHub Actions runs `bun run validate` and executes:

     ```bash
     eas build --platform android --profile production --auto-submit --non-interactive
     ```

   - EAS builds the production Android App Bundle (`.aab`) and submits it directly to the Google Play Store (Internal Testing track).

---

## 3. Manual Release & Build Commands (Fallback)

If you ever need to manually bump versions, generate release notes, or trigger EAS builds from your local CLI:

```bash
# Manual semantic version bumps
bun run version:patch # e.g. 1.0.3 -> 1.0.4
bun run version:minor # e.g. 1.0.3 -> 1.1.0
bun run version:major # e.g. 1.0.3 -> 2.0.0

# Generate release notes manually
bun run changelog

# Run full project validation
bun run validate

# Manual EAS Build triggers
bun run build:android:play # Android Production App Bundle (Google Play)
bun run build:android:apk  # Android Preview APK (for direct sideloading)
bun run build:ios:device   # iOS Preview Build
```
