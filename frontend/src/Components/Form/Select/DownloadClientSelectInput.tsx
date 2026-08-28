import React, { useMemo } from 'react';
import DownloadProtocol from 'DownloadClient/DownloadProtocol';
import { useDownloadClients } from 'Settings/DownloadClients/DownloadClients/useDownloadClients';
import { EnhancedSelectInputChanged } from 'typings/inputs';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import EnhancedSelectInput, {
  EnhancedSelectInputProps,
  EnhancedSelectInputValue,
} from './EnhancedSelectInput';

export interface DownloadClientSelectInputProps extends Omit<
  EnhancedSelectInputProps<number, EnhancedSelectInputValue<number>>,
  'values'
> {
  name: string;
  value: number;
  includeAny?: boolean;
  protocol?: DownloadProtocol;
  onChange: (change: EnhancedSelectInputChanged<number>) => void;
}

function DownloadClientSelectInput({
  includeAny = false,
  protocol = 'torrent',
  ...otherProps
}: Readonly<DownloadClientSelectInputProps>) {
  const { data, isFetching } = useDownloadClients();

  const values = useMemo(() => {
    const downloadClientValues = data
      .filter((downloadClient) => downloadClient.protocol === protocol)
      .sort(sortByProp('name'))
      .map((downloadClient) => {
        return {
          key: downloadClient.id,
          value: downloadClient.name,
          hint: `(${downloadClient.id})`,
        };
      });

    if (includeAny) {
      downloadClientValues.unshift({
        key: 0,
        value: `(${translate('Any')})`,
        hint: '',
      });
    }

    return downloadClientValues;
  }, [data, includeAny, protocol]);

  return (
    <EnhancedSelectInput
      {...otherProps}
      isFetching={isFetching}
      values={values}
    />
  );
}

export default DownloadClientSelectInput;
