import React from 'react';
import { useShowAdvancedSettings } from 'Settings/advancedSettingsStore';

interface WrappedComponentProps {
  advancedSettings: boolean;
}

// Eleven `connect()` components read this flag through `mapStateToProps`, which
// cannot reach a zustand store. Rather than rewrite each of them, the flag is
// injected as an own prop here and `connect` forwards it untouched, so every
// wrapped component keeps the prop contract it already had.
function withAdvancedSettings(
  WrappedComponent: React.ComponentType<WrappedComponentProps>
) {
  function AdvancedSettings(props: object) {
    const advancedSettings = useShowAdvancedSettings();

    return (
      <WrappedComponent
        {...(props as WrappedComponentProps)}
        advancedSettings={advancedSettings}
      />
    );
  }

  return AdvancedSettings;
}

export default withAdvancedSettings;
