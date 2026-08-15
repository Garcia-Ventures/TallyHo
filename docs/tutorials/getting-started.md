# Tutorial: Getting Started with TallyHo Development

Welcome to **TallyHo**! This step-by-step tutorial walks you through setting up your local development environment, installing dependencies, launching the development server on Web or Mobile, and running your first game session.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v20+ or v22 LTS recommended)
- **Bun** (v1.1+ recommended package manager & test runner)

  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

- **Git**

### Optional Mobile Prerequisites

- **iOS Development (macOS only)**: Xcode (v16+) and iOS Simulator.
- **Android Development**: Android Studio, Android SDK (API 34+), and Android Virtual Device (AVD).
- **Expo Go / Expo Orbit**: For testing on physical devices.

---

## 2. Clone and Install Dependencies

1. Clone the repository:

   ```bash
   git clone https://github.com/Garcia-Ventures/TallyHo.git
   cd TallyHo
   ```

2. Install project dependencies using Bun:

   ```bash
   bun install
   ```

3. Prepare local Git hooks (Husky):

   ```bash
   bun run prepare
   ```

---

## 3. Launching the Development Server

### Option A: Web Development (Fastest)

Run the web application in your browser powered by Metro Web:

```bash
bun run web
# or
bun run dev
```

Open [http://localhost:8081](http://localhost:8081) in your browser.

### Option B: iOS Simulator (macOS)

```bash
bun run ios
```

### Option C: Android Emulator

```bash
bun run android
```

---

## 4. Your First Game Session Walkthrough

1. **Create a Match**:
   - On the home screen, tap **+ Custom Match**.
   - Enter a game title (e.g. _"Rummy 500"_).
   - Select a scoring model: **Race to Target (High)**.
   - Set the Target Score (e.g. `500`).
2. **Add Players**:
   - Tap **+ Add Player**, select avatar colors/initials, and enter names.
   - Tap **🚀 Start Match**.
3. **Record Round Scores**:
   - Tap **🎮 Enter Play Mode →**.
   - Tap each player card, use the numeric keypad to enter their points, and tap **✓ Submit Round Score**.
4. **End Game & Celebrate**:
   - Tap **🏆 End Match** when the target score is reached.
   - Enjoy the confetti celebration and game highlight awards!

---

## 5. Running Code Quality & Verification

Before submitting changes, run the automated validation suite:

```bash
bun run validate
```

This runs Prettier formatting, ESLint checks, TypeScript type checks, and Vitest unit tests in parallel.

---

## Next Steps

- Explore the [How-To Guides](../how-to/testing-guide.md) to learn how to test changes.
- Read the [Architecture & Scoring Models Explanation](../explanation/architecture-and-scoring.md) to understand game mechanics.
- Consult the [CLI Scripts Reference](../reference/cli-scripts.md) for full commands.
