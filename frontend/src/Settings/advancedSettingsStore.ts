import { createPersist } from 'Helpers/createPersist';

interface AdvancedSettingsState {
  showAdvancedSettings: boolean;
}

// Persisted under its own key rather than the redux blob this replaces, so the
// toggle resets to off once per browser. It is a view preference with a visible
// control, and every options store converted so far started fresh the same way.
const advancedSettingsStore = createPersist<AdvancedSettingsState>(
  'advanced_settings',
  () => ({ showAdvancedSettings: false })
);

export const useShowAdvancedSettings = () => {
  return advancedSettingsStore((state) => state.showAdvancedSettings);
};

export const toggleShowAdvancedSettings = () => {
  advancedSettingsStore.setState((state) => ({
    showAdvancedSettings: !state.showAdvancedSettings,
  }));
};
