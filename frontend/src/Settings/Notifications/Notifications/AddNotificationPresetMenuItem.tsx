import React, { useCallback } from 'react';
import MenuItem from 'Components/Menu/MenuItem';
import { SelectedSchema } from 'Settings/useProviderSchema';

interface AddNotificationPresetMenuItemProps {
  name: string;
  implementation: string;
  implementationName: string;
  onPress: (selectedSchema: SelectedSchema) => void;
}

function AddNotificationPresetMenuItem({
  name,
  implementation,
  implementationName,
  onPress,
}: Readonly<AddNotificationPresetMenuItemProps>) {
  const handlePress = useCallback(() => {
    onPress({
      implementation,
      implementationName,
      presetName: name,
    });
  }, [implementation, implementationName, name, onPress]);

  return <MenuItem onPress={handlePress}>{name}</MenuItem>;
}

export default AddNotificationPresetMenuItem;
