import React, { useCallback } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { inputTypes } from 'Helpers/Props';
import { useStudioIndexOption } from 'Studio/Index/studioIndexOptionsStore';
import { CheckInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';

interface StudioIndexTableOptionsProps {
  onTableOptionChange(...args: unknown[]): unknown;
}

function StudioIndexTableOptions(props: StudioIndexTableOptionsProps) {
  const { onTableOptionChange } = props;

  const tableOptions = useStudioIndexOption('tableOptions');

  const { pageSize } = tableOptions;

  const onTableOptionChangeWrapper = useCallback(
    ({
      name,
      value,
    }: CheckInputChanged | { name: string; value: number | null }) => {
      onTableOptionChange({
        tableOptions: {
          ...tableOptions,
          [name]: value,
        },
      });
    },
    [tableOptions, onTableOptionChange]
  );

  return (
    <FormGroup>
      <FormLabel>{translate('TablePageSize')}</FormLabel>
      <FormInputGroup
        type={inputTypes.NUMBER}
        name="pageSize"
        value={pageSize}
        min={10}
        max={1000}
        helpText={translate('TablePageSizeHelpText')}
        helpTextWarning={translate('TablePageSizeMinMaxHelpText', {
          min: 10,
          max: 1000,
        })}
        onChange={onTableOptionChangeWrapper}
      />
    </FormGroup>
  );
}

export default StudioIndexTableOptions;
