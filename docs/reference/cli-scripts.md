# Reference: CLI Scripts & Tooling

Complete reference of all development, build, validation, and release scripts defined in `package.json`.

---

## 1. Development & Quality Scripts

| Command                     | Description                                                                                 |
| :-------------------------- | :------------------------------------------------------------------------------------------ |
| `bun run dev` / `bun start` | Starts the local Metro bundler development server.                                          |
| `bun run start:clean`       | Starts development server with a clear cache (`expo start -c`).                             |
| `bun run web`               | Launches the web application in a browser.                                                  |
| `bun run ios`               | Compiles and launches the app on an iOS simulator.                                          |
| `bun run android`           | Compiles and launches the app on an Android emulator or device.                             |
| `bun test` / `bun run test` | Runs the test suite via Vitest.                                                             |
| `bun run validate`          | Executes full validation suite (Prettier check, ESLint, TypeScript `tsc --noEmit`, Vitest). |
| `bun run validate:fix`      | Runs full validation and automatically resolves formatting and mechanical lint issues.      |
| `bun run format`            | Runs Prettier across all project files.                                                     |
| `bun run lint`              | Runs ESLint with caching.                                                                   |

---

## 2. EAS Build & Cloud Deployment Scripts

| Command                      | Profile       | Target Platform | Distribution Track / Artifact                               |
| :--------------------------- | :------------ | :-------------- | :---------------------------------------------------------- |
| `bun run build:android:play` | `production`  | Android         | `.aab` (Automated submission to Google Play Internal track) |
| `bun run build:android:apk`  | `preview`     | Android         | Standalone `.apk` for direct device installation            |
| `bun run build:ios:store`    | `production`  | iOS             | `.ipa` for TestFlight / App Store submission                |
| `bun run build:ios:device`   | `preview`     | iOS             | Ad-hoc internal preview build for registered devices        |
| `bun run build:ios:sim`      | `development` | iOS             | iOS Simulator build with Dev Client                         |
| `bun run submit:android`     | `production`  | Android         | Explicit manual submission to Google Play internal track    |

---

## 3. Versioning & Changelog Scripts

| Command                 | Parameters  | Description                                                                                           |
| :---------------------- | :---------- | :---------------------------------------------------------------------------------------------------- |
| `bun run version:bump`  | `<version>` | Synchronizes version across `package.json` and `app.json`.                                            |
| `bun run version:patch` | None        | Increments patch version (e.g. `1.0.2` ➔ `1.0.3`).                                                    |
| `bun run version:minor` | None        | Increments minor version (e.g. `1.0.2` ➔ `1.1.0`).                                                    |
| `bun run version:major` | None        | Increments major version (e.g. `1.0.2` ➔ `2.0.0`).                                                    |
| `bun run changelog`     | `[version]` | Extracts commits following Conventional Commits and updates `CHANGELOG.md` & `docs/RELEASE_NOTES.md`. |
