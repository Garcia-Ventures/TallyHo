# TallyHo Documentation

Welcome to the **TallyHo** documentation. This directory is organized according to the **[Diátaxis Framework](https://diataxis.fr/)**, separating documentation into four distinct modes: **Tutorials**, **How-To Guides**, **Reference**, and **Explanation**.

---

## 🧭 Documentation Map

```text
docs/
├── tutorials/       # Learning-oriented: getting started step-by-step
├── how-to/          # Task-oriented: practical recipes to solve problems
├── reference/       # Information-oriented: technical specifications & dictionaries
└── explanation/     # Understanding-oriented: architectural decisions & concepts
```

---

## 1. 🎓 Tutorials (Learning-Oriented)

Practical lessons designed to take you by the hand and help you achieve your first results:

- **[Getting Started with TallyHo](tutorials/getting-started.md)** — Set up your local environment, install dependencies, run on Web/iOS/Android, and play your first match.

---

## 2. 🛠️ How-To Guides (Task-Oriented)

Step-by-step guides helping you solve specific real-world tasks and problems:

- **[Testing & Quality Assurance](how-to/testing-guide.md)** — Run Vitest unit tests, type-checking, and execute automated Maestro UI flows.
- **[Release & Deployment](how-to/release-and-deployment.md)** — Semantic version bumping, changelog compilation, and automated EAS cloud builds.
- **[Contributing Guide](how-to/contributing.md)** — Branching off `develop`, Conventional Commits, code style, and submitting Pull Requests.

---

## 3. 📖 Reference (Information-Oriented)

Technical descriptions, API signatures, dictionaries, and command catalogs:

- **[CLI Scripts & Tooling](reference/cli-scripts.md)** — Complete catalog of all `package.json` scripts, validation flags, and EAS commands.
- **[Store Metadata & Assets](reference/store-metadata.md)** — App Store & Google Play listing copy, keywords, and screenshot specifications.
- **[Observability & Telemetry](reference/observability.md)** — Sentry crash reporting, Error Boundaries, and OpenPanel analytics event taxonomy.
- **[Release Notes Template](RELEASE_NOTES.md)** — Generated release notes from conventional commits.

---

## 4. 💡 Explanation (Understanding-Oriented)

Discussions exploring background context, design rationale, and architecture:

- **[Architecture & Scoring Mechanics](explanation/architecture-and-scoring.md)** — Paper-and-ink aesthetic design philosophy and the 3 core scoring models.
- **[Branching Strategy & Versioning](explanation/branching-and-versioning.md)** — Two-branch Git Flow (`main` & `develop`) and SemVer 2.0.0 rationale.
- **[Persistence & Migrations](explanation/persistence-and-migrations.md)** — Zustand state stores, AsyncStorage hydration, and schema migration strategies.

---

## 🔒 Private & Operational Strategy

Internal operational runbooks, sensitive signing keystores, and store questionnaires are stored securely in the internal Obsidian vault (`eng618-Vault/Garcia Ventures/GVTech/TallyHo/`).
