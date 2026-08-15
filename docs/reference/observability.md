# Reference: Observability & Telemetry

This reference details the crash reporting, exception handling, and self-hosted analytics architecture implemented in **TallyHo**.

---

## 1. Sentry Crash Reporting

TallyHo integrates `@sentry/react-native` with the Expo Sentry config plugin.

### Configuration

- **Initialization**: Configured in `src/utils/sentry.ts` via `Sentry.init()`.
- **Environment**: Automatically captures `production`, `preview`, or `development`.
- **Release Tracking**: Tagged with format `com.gventureshq.tallyho@<version>+<versionCode>`.
- **Privacy & Sanitization**: Sentry strips PII (Personal Identifiable Information) before transmission.

### Crash Boundary

The application wraps root screens in an Error Boundary (`src/components/ErrorBoundary.tsx`), providing fallback UI with a one-tap reload and automated breadcrumb capture.

---

## 2. OpenPanel Analytics (Self-Hosted)

TallyHo uses self-hosted OpenPanel instances via `@openpanel/react-native` and `@openpanel/web` for product telemetry:

### Environment Variables

- `EXPO_PUBLIC_OPENPANEL_CLIENT_ID`: Client application identifier.
- `EXPO_PUBLIC_OPENPANEL_API_URL`: Self-hosted OpenPanel ingestion endpoint (`https://openpanel.gventureshq.com/api`).

### Tracked Event Taxonomy

| Event Name           | Trigger                          | Payload                                      |
| :------------------- | :------------------------------- | :------------------------------------------- |
| `match_started`      | New game initialized             | `{ scoringModel, playerCount, targetScore }` |
| `round_completed`    | Round points submitted           | `{ roundNumber, leaderMargin }`              |
| `match_completed`    | Winner declared / match finished | `{ totalRounds, winnerId, durationMinutes }` |
| `paywall_viewed`     | Pro modal opened                 | `{ source }`                                 |
| `purchase_success`   | In-app purchase verified         | `{ package, isPro }`                         |
| `purchases_restored` | Restore purchases button tapped  | `{ isPro }`                                  |
