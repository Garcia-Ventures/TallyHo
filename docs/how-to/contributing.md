# How-To Guide: Contributing to TallyHo

Thank you for contributing to **TallyHo**! This guide outlines our development workflow, code style standards, branch management, and Pull Request (PR) guidelines.

---

## 1. Development Workflow

1. **Fork or Branch**:
   Always branch off `develop` for new features or bug fixes:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/my-new-feature
   ```

2. **Make Changes**:
   - Write clean, type-safe TypeScript code.
   - Adhere to the soft paper-and-ink aesthetic tokens (`#FDFBF7` cream canvas, `#2C302E` slate ink).
   - Add unit tests for any new game rules or store logic.

3. **Validate Codebase**:

   ```bash
   bun run validate
   ```

4. **Commit Following Conventional Commits**:

   ```bash
   git commit -m "feat(scoreboard): add turn timer indicator"
   ```

---

## 2. Code Quality & Standards

- **TypeScript**: Strict type-checking enabled. No `any` types unless strictly necessary and commented.
- **Styling**: Use NativeWind Tailwind CSS utility classes and design tokens from `@gv-tech/design-tokens`.
- **State Management**: Keep state minimal, immutable, and encapsulated in Zustand stores (`src/stores/`).
- **Formatting**: Code formatting is enforced via Prettier with `@eng618/prettier-config`.

---

## 3. Pull Request Guidelines

1. Push your branch to GitHub:

   ```bash
   git push origin feat/my-new-feature
   ```

2. Open a Pull Request targeting the **`develop`** branch.
3. Provide a clear description of the change, test coverage, and screenshots for any UI updates.
4. Ensure all GitHub Actions CI checks pass.
