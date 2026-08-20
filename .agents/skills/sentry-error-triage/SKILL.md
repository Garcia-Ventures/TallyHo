---
name: sentry-error-triage
description: Automated runbook and workflow for querying Sentry via MCP or API, extracting crash stack traces, identifying source lines in TallyHo, reproducing issues, and writing verified fixes.
---

# Sentry Error Triage & Bugfix Workflow

Use this skill when investigating production/preview crashes, user-reported issues, or triaging Sentry alerts for TallyHo.

## Sentry Project Context

- **Organization**: `garcia-ventures`
- **Project**: `react-native`
- **MCP Endpoint**: `https://mcp.sentry.dev/mcp/garcia-ventures/react-native`

---

## 6-Step Triage & Resolution Procedure

### 1. Discover & Query Unresolved Issues

Query the Sentry MCP server tools to list recent unresolved issues:

- Find high-frequency or newly introduced crashes:
  - Query: `is:unresolved issue.priority:[high, medium]`
  - Tag filters: `release:com.gventureshq.tallyho@*`, `environment:production`

### 2. Inspect Error Details & Stack Trace

For the target issue, fetch full event details:

- **Exception Class & Message**: Note the specific error (e.g. `TypeError: undefined is not an object`, `Uncaught Exception`, etc.).
- **Stack Frames**: Extract in-app frames pointing to `src/` or `app/` files.
- **Breadcrumbs**: Review user actions immediately preceding the crash (e.g., button taps, navigation transitions, store actions).
- **Device & OS Context**: Review iOS/Android versions, screen resolutions, and offline/network conditions.

### 3. Map to Codebase

- Open the failing file and line range using `view_file` or `grep_search`.
- Identify what state or undefined prop triggered the error (e.g. null safety, missing optional chaining, unhandled Promise rejection, audio playback state, or storage read failure).

### 4. Write Regression Test

- Create or update a unit test in the relevant `__tests__/` directory to reproduce the scenario.
- Verify the test fails before applying the fix.

### 5. Implement Fix

- Implement safe defensive handling (e.g., fallback defaults, boundary checks, nullish coalescing `??`, optional chaining `?.`).
- If an unhandled React render error occurs, ensure component error boundaries or UI fallback states handle it gracefully.

### 6. Verify & Document

- Run `bun test` to confirm the regression test passes and all existing suites stay green.
- If applicable, resolve the issue in Sentry or update documentation.
