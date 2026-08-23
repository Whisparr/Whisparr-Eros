import { createPersist } from 'Helpers/createPersist';

interface SafeForWorkState {
  safeForWorkMode: boolean;
}

// The key `createPersistState` writes the redux blob under, and the fixed key
// it migrated from before instance names were part of it.
const LEGACY_FALLBACK_KEY = 'WhisparrEros';

// Replaces `persistState: ['settings.safeForWorkMode']`. Reads the value out of
// the redux blob once so the setting survives the move rather than silently
// resetting to unblurred.
//
// Safe to do at module scope: `bootstrap.tsx` imports `App`, which reaches this
// module through `Page`, and ES imports evaluate before `bootstrap()` calls
// `createAppStore()`. So this runs before redux can rewrite the blob without
// the path it no longer persists.
function getLegacySafeForWorkMode(): boolean {
  try {
    const instanceKey =
      window.Whisparr.instanceName?.toLowerCase().replace(/ /g, '_') ||
      LEGACY_FALLBACK_KEY;

    const raw =
      localStorage.getItem(instanceKey) ??
      localStorage.getItem(LEGACY_FALLBACK_KEY);

    if (!raw) {
      return false;
    }

    return JSON.parse(raw)?.settings?.safeForWorkMode === true;
  } catch {
    // A private window, cleared site data, or a blob that is not ours.
    return false;
  }
}

const safeForWorkStore = createPersist<SafeForWorkState>(
  'safe_for_work',
  () => ({
    safeForWorkMode: getLegacySafeForWorkMode(),
  })
);

// `persist` only writes on a state change, and redux drops
// `settings.safeForWorkMode` from its blob the first time it writes without it
// -- so a migrated value nobody touches would be read once and then lost on the
// next reload. Write it straight back to claim the zustand key. Rehydration
// from localStorage is synchronous, so by here this is the persisted value when
// there is one and the migrated value when there is not.
safeForWorkStore.setState((state) => ({
  safeForWorkMode: state.safeForWorkMode,
}));

export const useSafeForWorkMode = () =>
  safeForWorkStore((state) => state.safeForWorkMode);

export const toggleSafeForWorkMode = () => {
  safeForWorkStore.setState((state) => ({
    safeForWorkMode: !state.safeForWorkMode,
  }));
};
