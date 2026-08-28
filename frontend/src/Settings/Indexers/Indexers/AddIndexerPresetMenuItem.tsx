import React, { useCallback } from 'react';
import MenuItem, { MenuItemProps } from 'Components/Menu/MenuItem';
import { SelectedSchema } from 'Settings/useProviderSchema';

interface AddIndexerPresetMenuItemProps extends Omit<
  MenuItemProps,
  'children' | 'onPress'
> {
  name: string;
  implementation: string;
  implementationName: string;
  onPress: (selectedSchema: SelectedSchema) => void;
}

function AddIndexerPresetMenuItem({
  name,
  implementation,
  implementationName,
  onPress,
  ...otherProps
}: Readonly<AddIndexerPresetMenuItemProps>) {
  const handlePress = useCallback(() => {
    onPress({
      implementation,
      implementationName,
      presetName: name,
    });
  }, [name, implementation, implementationName, onPress]);

  return (
    <MenuItem {...otherProps} onPress={handlePress}>
      {name}
    </MenuItem>
  );
}

export default AddIndexerPresetMenuItem;
