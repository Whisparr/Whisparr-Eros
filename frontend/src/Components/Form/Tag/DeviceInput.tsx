import React, { useCallback, useMemo } from 'react';
import FormInputButton from 'Components/Form/FormInputButton';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import useProviderOptions, {
  ProviderOptions,
  ProviderOptionsDevice,
} from 'Settings/useProviderOptions';
import { InputChanged } from 'typings/inputs';
import TagInput, { TagInputProps } from './TagInput';
import styles from './DeviceInput.css';

interface DeviceTag {
  id: string;
  name: string;
}

export interface DeviceInputProps extends TagInputProps<DeviceTag> {
  className?: string;
  name: string;
  value: string[];
  hasError?: boolean;
  hasWarning?: boolean;
  provider: string;
  providerData: ProviderOptions;
  onChange: (change: InputChanged<string[]>) => unknown;
}

function DeviceInput({
  className = styles.deviceInputWrapper,
  name,
  value,
  hasError,
  hasWarning,
  provider,
  providerData,
  onChange,
}: DeviceInputProps) {
  const {
    data: items,
    isFetching,
    refetch,
  } = useProviderOptions<ProviderOptionsDevice>({
    provider,
    action: 'getDevices',
    providerData,
  });

  const selectedDevices = useMemo(() => {
    return value.map((valueDevice) => {
      const device = items.find((d) => d.id === valueDevice);

      if (device) {
        return {
          id: device.id,
          name: `${device.name} (${device.id})`,
        };
      }

      return {
        id: valueDevice,
        name: `Unknown (${valueDevice})`,
      };
    });
  }, [items, value]);

  const handleRefreshPress = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTagAdd = useCallback(
    (device: DeviceTag) => {
      // New tags won't have an ID, only a name.
      const deviceId = device.id || device.name;

      onChange({
        name,
        value: [...value, deviceId],
      });
    },
    [name, value, onChange]
  );

  const handleTagDelete = useCallback(
    ({ index }: { index: number }) => {
      const newValue = value.slice();
      newValue.splice(index, 1);

      onChange({
        name,
        value: newValue,
      });
    },
    [name, value, onChange]
  );

  return (
    <div className={className}>
      <TagInput
        inputContainerClassName={styles.input}
        name={name}
        tags={selectedDevices}
        tagList={items}
        allowNew={true}
        minQueryLength={0}
        hasError={hasError}
        hasWarning={hasWarning}
        onTagAdd={handleTagAdd}
        onTagDelete={handleTagDelete}
      />

      <FormInputButton onPress={handleRefreshPress}>
        <Icon name={icons.REFRESH} isSpinning={isFetching} />
      </FormInputButton>
    </div>
  );
}

export default DeviceInput;
