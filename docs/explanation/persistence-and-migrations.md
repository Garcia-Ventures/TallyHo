# Explanation: Persistence & State Stores

TallyHo is offline-first. Match state, the player library, and settings live on the device. There is no account and no schema-version field. Add a migration only when a stored shape actually changes.

## Stores

- **`useGameStore`**: Active match, round log, and finished match archive.
- **`usePlayerLibraryStore`**: Reusable player names and colors.
- **`useSettingsStore`**: Theme, sound, haptics, and ad-free status.

`app/_layout.tsx` calls `hydrateStorage()` before `loadInitialData`, `loadPlayers`, and `loadSettings`.

## Storage adapter

`src/services/storage-core.ts` is the API. The driver underneath it depends on the platform:

- **Web** (`storage.ts`): `localStorage`, with an in-memory fallback when `localStorage` is missing (unit tests and some embedded runtimes).
- **Native** (`storage.native.ts`): AsyncStorage. Hydration copies the four keys into memory. Later reads and writes stay synchronous against that memory and flush to AsyncStorage.

The four keys are `tallyho_active_game`, `tallyho_match_history`, `tallyho_player_library`, and `tallyho_settings`.

Corrupt JSON is ignored and logged. Match history keeps the newest 50 games. Clearing history and "Erase Everything" both go through this API and then refresh the Zustand stores, so the home screen does not keep showing deleted matches.

## What is not stored

Game ids come from `generateId`. There is no `_schemaVersion`. Fixed-round games are not part of the stored model. The app records race-to-high and race-to-low matches only.
