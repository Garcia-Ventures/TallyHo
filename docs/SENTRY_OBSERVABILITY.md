# Sentry Telemetry & Observability Guide

## 1. Overview

Tally Ho uses **Sentry** (`@sentry/react-native`) for real-time error tracking, crash reporting, session replay, and performance breadcrumbs.

---

## 2. Architecture & Configuration

- **Initialization**: Configured in [`app/_layout.tsx`](file:///Users/engarcia/Development/GVTech/TallyHo/app/_layout.tsx) via `Sentry.init()`.
- **Root Wrapper**: The root layout component is wrapped with `Sentry.wrap()`.
- **Top-Level Error Boundary**: The app UI is wrapped in [`ErrorBoundary`](file:///Users/engarcia/Development/GVTech/TallyHo/src/components/ErrorBoundary.tsx) to capture render-tree exceptions without crashing the device app process.
- **Central Telemetry Utility**: Located in [`src/utils/sentry.ts`](file:///Users/engarcia/Development/GVTech/TallyHo/src/utils/sentry.ts).

---

## 3. Sentry DSN & Environment Setup

The Sentry DSN is configured as:
`https://ba35c9ea2c45d64b131f6b854cd5c3ea@o4511873601306624.ingest.us.sentry.io/4511873607991296`

For environment isolation, set `SENTRY_ENVIRONMENT` in build environment configs (`development`, `preview`, `production`).

---

## 4. Telemetry Usage Patterns

### Logging Exceptions

Import `captureException` from `src/utils/sentry`:

```typescript
import { captureException } from '../utils/sentry';

try {
  // Action
} catch (error) {
  captureException(error, { action: 'submit_round_score', playerId });
}
```

### Recording State & Lifecycle Breadcrumbs

Use `trackMatchEvent` or `addBreadcrumb`:

```typescript
import { trackMatchEvent } from '../utils/sentry';

trackMatchEvent('match_created', {
  gameId: 'game_123',
  presetId: 'rummy_500',
  playerCount: 4,
});
```

---

## 5. Release Source Map Uploads

Source maps are automatically generated during EAS production builds via `@sentry/react-native/expo` plugin configured in `app.json`.
Ensure `SENTRY_AUTH_TOKEN` is set as an encrypted secret in EAS Secrets / GitHub Secrets.
