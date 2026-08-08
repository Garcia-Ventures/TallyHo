# Testing & Quality Assurance Guide

## 1. Overview

This document outlines the testing strategy, test suites, execution commands, and coverage targets for **Tally Ho**.

---

## 2. Test Execution Commands

| Test Level       | Command              | Description                                                                    |
| :--------------- | :------------------- | :----------------------------------------------------------------------------- |
| **All Checks**   | `bun run validate`   | Master project validation: Prettier, ESLint, TypeScript check, and Unit Tests. |
| **Unit Tests**   | `bun test`           | Runs Vitest / Bun test runner on unit test files (`*.test.ts`).                |
| **Linting**      | `bun run lint`       | ESLint check across JavaScript and TypeScript files.                           |
| **Type Check**   | `bun x tsc --noEmit` | Strict static type checking via TypeScript compiler.                           |
| **Format Check** | `bun run format:ci`  | Prettier code formatting compliance check.                                     |

---

## 3. Unit & Logic Tests

- **Target Coverage**: $\ge 85\%$ statement coverage on business logic (`src/logic/`, `src/utils/`, `src/stores/`).
- **Framework**: Vitest / Bun Test (`bun test`).

### Existing Unit Test Specs

- [`src/utils/scoring.test.ts`](file:///Users/engarcia/Development/GVTech/TallyHo/src/utils/scoring.test.ts): Tests scoring calculations, player sorting, and win condition checks.
- [`src/stores/useGameStore.test.ts`](file:///Users/engarcia/Development/GVTech/TallyHo/src/stores/useGameStore.test.ts): Tests game session creation, score submission, match completion, and state resets.

---

## 4. End-to-End (E2E) Testing with Maestro

E2E UI automation is powered by **Maestro**.

### Maestro Flow Specs

Located in [`.maestro/match-flow.yaml`](file:///Users/engarcia/Development/GVTech/TallyHo/.maestro/match-flow.yaml).

### Running Maestro Tests Locally

1. Start Android Emulator or connect physical Android device.
2. Launch app dev server / build: `bun run android`.
3. Execute Maestro test flow:

   ```bash
   maestro test .maestro/match-flow.yaml
   ```
