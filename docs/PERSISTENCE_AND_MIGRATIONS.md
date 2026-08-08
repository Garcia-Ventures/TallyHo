# Local State Persistence & Migration Strategy

## 1. Overview

Tally Ho uses **AsyncStorage** / local storage wrappers backed by **Zustand** stores (`useGameStore`, `usePlayerLibraryStore`, `useSettingsStore`). Because the app operates 100% offline, local state structure integrity is critical across app updates.

---

## 2. Store Schemas & Storage Keys

| Store                   | Storage Key                                    | Description                                                               |
| :---------------------- | :--------------------------------------------- | :------------------------------------------------------------------------ |
| `useGameStore`          | `tallyho_active_game`, `tallyho_match_history` | Active match session data, player round scores, completed match archives. |
| `usePlayerLibraryStore` | `tallyho_player_library`                       | Frequently played family/friend player profiles & avatars.                |
| `useSettingsStore`      | `tallyho_user_settings`                        | App preferences (Theme, Audio effects, Haptics).                          |

---

## 3. Schema Versioning & Migration Architecture

To prevent store corruption or crashes when modifying state contracts in future app versions:

1. **Version Key**: Every store persistence configuration maintains a `version: NUMBER` identifier (e.g. `version: 1`).
2. **Migration Function**: Zustand `migrate` handles transformation when stored version is less than current store version.

### Migration Example Pattern

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  version: number;
  themeMode: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      version: 1,
      themeMode: 'system',
      soundEnabled: true,
      hapticsEnabled: true,
    }),
    {
      name: 'tallyho_user_settings',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from v0 to v1 schema
          return {
            ...persistedState,
            hapticsEnabled: true,
          };
        }
        return persistedState as SettingsState;
      },
    },
  ),
);
```

---

## 4. Reset & Cache Clearing Behavior

Per Google Play compliance and troubleshooting standards, users can purge all persisted data via **Settings > Reset Local Storage & Settings**.

This resets all keys back to initial default values:

```typescript
storage.clearActiveGame();
storage.clearHistory();
storage.clearPlayerLibrary();
storage.clearSettings();
```
