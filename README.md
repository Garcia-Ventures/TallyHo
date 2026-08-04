# Tally Ho

> _Your digital pencil & paper for game night._

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/eng618)

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

- `bun run dev` / `bun start` — Launches the application development server.
- `bun run ios` / `bun run android` / `bun run web` — Runs the application on specific platform targets.
- `bun test` — Executes the test suite using Bun.
- `bun run validate` — Runs formatting, linting, and type checks.
- `bun run validate:fix` — Automatically fixes formatting and lint issues.

---

## Documentation

Comprehensive project and workflow documentation is located in the [`docs`](docs/) directory:

- **[Product Specification](docs/TallyHo.md)** — Detailed vision, design aesthetics, user flows, and score mechanics.
- **[Documentation Overview](docs/README.md)** — Guide to project documentation files.
- **[Branching Strategy](docs/BRANCHING.md)** — Git workflow and branching standards.
- **[Contributing Guide](docs/CONTRIBUTING.md)** — Standards and procedures for contributing.

---

## Branching Model

This repository follows a two-branch git strategy:

- **`main`** — Production-ready, stable code.
- **`develop`** — Main integration branch for active development and staging.

For detailed guidelines, refer to [BRANCHING.md](docs/BRANCHING.md).

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details on code standards, pull requests, and commit guidelines.

---

## Security

Refer to our [Security Policy](SECURITY.md) for details on reporting security vulnerabilities.

---

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
