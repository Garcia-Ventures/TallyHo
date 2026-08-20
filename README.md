<p align="center">
  <img src="./assets/logo.png" alt="TallyHo Logo" width="480" />
</p>

<p align="center">
  <em>Your digital pencil & paper for game night.</em>
</p>

<p align="center">
  <a href="https://www.buymeacoffee.com/eng618"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="42" /></a>
</p>

**Tally Ho** is a versatile, multiplayer scorekeeping application for mobile and web devices. Designed as a universal table utility, it replaces physical paper score pads with an elegant, paper-inspired digital surface. Players create a game, add participants, set target scores or winning conditions, and record points round by round—eliminating late-night arithmetic and missing pens so everyone can focus on the fun.

---

## Features

- **Tactile Paper-and-Ink Aesthetic:** Built with soft cream tones (`#FDFBF7`), slate charcoal ink (`#2C302E`), retro accents, and tactile haptic feedback.
- **Universal Scoring Models:** Supports Race to Target (High/Low) and Fixed Rounds out-of-the-box (e.g., _Rummy_, _Uno_, _Pass the Pigs_, _Qwirkle_).
- **Dynamic Leaderboard & Live Stats:** Real-time point tallies, point margins to the lead, and end-of-game highlight summaries (e.g., "Biggest Comeback").
- **Round History & Transparent Edits:** Complete visibility into past rounds with one-tap score corrections.
- **Player Profiles & Avatars:** Customizable colors, initials, and quick-add player profiles for your regular game night group.
- **Zero Distractions:** Clean, unobtrusive table utility with no ad banners or intrusive popups during gameplay.

---

## Gameplay & Scoring Mechanics

| Scoring Model             | Target Condition                    | Example Games                                   | Game Logic                                                            |
| ------------------------- | ----------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------- |
| **Race to Target (High)** | First to reach or exceed $X$ points | _Rummy (500)_, _Qwirkle_, _Pass the Pigs (100)_ | Game ends when a player passes target points; highest score wins.     |
| **Race to Target (Low)**  | Stay under $X$ points               | _Uno (500)_, _Hearts_                           | Game ends when a player hits/exceeds target; lowest total score wins. |
| **Fixed Rounds**          | Most points after $N$ rounds        | _Trivia_, _Custom Card Games_                   | Game ends after round $N$; highest cumulative points wins.            |

---

## Tech Stack & Architecture

- **Core Framework:** [Expo React Native](https://expo.dev/) / [Expo Router](https://docs.expo.dev/router/introduction/) (Universal Mobile & Web)
- **UI & Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS v4), `@gv-tech/design-tokens`, `@gv-tech/ui-web`
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Icons & Animations:** [Lucide React](https://lucide.dev/), `react-native-reanimated`, `canvas-confetti`
- **Build & Bundling:** [Vite](https://vitejs.dev/) / [Bun](https://bun.sh/)

---

## Quick Start

### Prerequisites

Ensure you have [Bun](https://bun.sh/) (or Node.js) installed on your system.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/eng618/TallyHo.git
   cd TallyHo
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start the development server:**

   ```bash
   bun run dev
   # or for Expo development server
   bun start
   ```

---

## Available Scripts

In the project directory, you can run:

### Development & Quality

- `bun run dev` / `bun start` — Launches the application development server.
- `bun run ios` / `bun run android` / `bun run web` — Runs the application on specific platform targets.
- `bun test` — Executes the test suite using Vitest.
- `bun run validate` — Runs full validation (Prettier, ESLint, TypeScript types, Vitest).
- `bun run validate:fix` — Automatically fixes formatting and lint issues.

### EAS Builds & Submission

- `bun run build:ios:sim` — Builds iOS simulator development build via EAS.
- `bun run build:ios:device` — Builds iOS preview build for ad-hoc / internal devices.
- `bun run build:ios:store` — Builds iOS production `.ipa` for TestFlight and App Store.
- `bun run build:android:apk` — Builds Android preview `.apk` for direct device testing.
- `bun run build:android:play` — Builds Android production `.aab` for Google Play Console.
- `bun run submit:android` — Submits production Android build directly to Google Play internal track.

### Versioning & Release

- `bun run version:bump <version>` — Synchronizes version bump in `package.json` and `app.json`.
- `bun run version:patch` / `minor` / `major` — Semantic version bumping scripts.
- `bun run changelog` — Generates release notes from conventional commits.

---

## Production Release & In-App Purchases (IAP)

For release runbooks and build commands, see the **[Release & Deployment Guide](docs/how-to/release-and-deployment.md)** and internal planning documents in your Obsidian vault.

> **Target Release Focus:** Android (Google Play) & Web.
>
> **Note:** iOS App Store releases are currently on pause pending an active Apple Developer account. All automated tag builds and pre-launch checklists are optimized for Google Play and Web distributions.

### Quick Pre-Flight Checklist

- [x] **Code Quality & Tests:** Verified via `bun run validate` (0 type errors, 100% test pass).
- [ ] **Google Play IAP Setup:** Configure In-App Products & Subscriptions in Google Play Console.
- [ ] **RevenueCat Dashboard:** Map Products to Entitlement `TallyHo Pro` under Offering `default` (`lifetime`, `yearly`, `monthly`).
- [ ] **EAS Production Secrets:** Set `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` via `eas secret:create`.
- [ ] **Automated EAS Release:** Push tag `v*.*.*` to trigger [`.github/workflows/release.yml`](.github/workflows/release.yml) (Android production `.aab`).
- [ ] **Sandbox & E2E Testing:** Verify purchase flows via Google Play License Testing and Maestro (`maestro test .maestro/match-flow.yaml`).

---

## Documentation

Project documentation is structured according to the **[Diátaxis Framework](docs/README.md)**:

### 🎓 Tutorials

- **[Getting Started](docs/tutorials/getting-started.md)** — Step-by-step local setup, mobile/web development, and first match walkthrough.

### 🛠️ How-To Guides

- **[Testing & Quality Assurance](docs/how-to/testing-guide.md)** — Executing Vitest unit tests, type-checking, and Maestro E2E flows.
- **[Release & Deployment](docs/how-to/release-and-deployment.md)** — Version bumps, changelog generation, and automated EAS builds.
- **[Contributing Guide](docs/how-to/contributing.md)** — Git workflow, Conventional Commits, code standards, and PR guidelines.

### 📖 Reference

- **[CLI Scripts & Tooling](docs/reference/cli-scripts.md)** — Complete catalog of all `package.json` scripts and EAS commands.
- **[Store Metadata & Assets](docs/reference/store-metadata.md)** — Store copy, keywords, and screenshot specifications.
- **[Observability & Telemetry](docs/reference/observability.md)** — Sentry crash monitoring and OpenPanel analytics event taxonomy.

### 💡 Explanation

- **[Architecture & Scoring Mechanics](docs/explanation/architecture-and-scoring.md)** — Paper-and-ink aesthetic design philosophy and scoring models.
- **[Branching & Versioning](docs/explanation/branching-and-versioning.md)** — Two-branch Git Flow (`main` / `develop`) and SemVer 2.0.0 rationale.
- **[Persistence & Migrations](docs/explanation/persistence-and-migrations.md)** — Offline-first Zustand state stores and schema migration design.

---

## Branching Model

This repository follows a two-branch git strategy (`main` & `develop`). For detailed guidelines, refer to **[Branching Strategy & Versioning](docs/explanation/branching-and-versioning.md)**.

---

## Contributing

Contributions are welcome! Please read our **[Contributing Guide](docs/how-to/contributing.md)** for details on code standards, pull requests, and commit guidelines.

---

## Security

Refer to our [Security Policy](SECURITY.md) for details on reporting security vulnerabilities.

---

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
