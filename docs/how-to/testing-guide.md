# How-To Guide: Testing & Quality Assurance

This guide explains how to execute unit tests, component tests, static analysis, and automated End-to-End (E2E) UI flows in **TallyHo**.

---

## 1. Running Unit Tests

TallyHo uses [Vitest](https://vitest.dev/) for fast unit and state testing.

### Run All Unit Tests

```bash
bun test
# or
bun run test
```

### Watch Mode (Interactive Development)

```bash
bun x vitest
```

### Targeted Test Execution

```bash
# Test Game Store logic
bun x vitest src/stores/useGameStore.test.ts

# Test Scoring utility algorithms
bun x vitest src/utils/scoring.test.ts
```

### Coverage

```bash
bun run test:coverage
```

The report includes `src/` only. The thresholds in `vitest.config.ts` fail the run when coverage drops under the floor.

Route tests may sit next to screens under `app/` (`*.test.tsx`). Metro ignores those files, so they are not routes and they are not part of the web or native bundle. Vitest still runs them.

---

## 2. Full Codebase Validation

To run formatting checks, Oxlint linting, TypeScript compilation, and unit tests in one command:

```bash
bun run validate
```

To automatically fix formatting and lint errors:

```bash
bun run validate:fix
# or
bun run format
```

---

## 3. End-to-End (E2E) UI Testing with Maestro

TallyHo uses [Maestro](https://maestro.mobile.dev/) for automated black-box UI interaction testing against running iOS Simulators and Android Emulators.

### Prerequisites

Install the Maestro CLI:

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

### Running Maestro Flow

1. Start your local Android emulator or iOS simulator:

   ```bash
   bun run android
   # or
   bun run ios
   ```

2. Execute the match flow test:

   ```bash
   maestro test .maestro/match-flow.yaml
   ```

### What the Maestro Flow Verifies

- App launches and displays the paper-and-ink canvas.
- Custom game creation with player setup.
- Play Mode navigation, keypad score entry, and round submission.
- End match flow, confetti victory screen, and rematch navigation.

---

## 4. Continuous Integration (CI)

All PRs and pushes to `main` and `dev` automatically run the validation suite in GitHub Actions ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)). CI checks Maestro flow files by parsing their YAML. It does not launch a simulator.

`bun run test:coverage` (and CI) enforces a Vitest coverage floor on `src/`. The floor sits just under the current suite. Raise it when a change covers more of a file. A jump to a round target such as 80% in one pull request adds noise without new tests. Route files under `app/` are not in that coverage include.
