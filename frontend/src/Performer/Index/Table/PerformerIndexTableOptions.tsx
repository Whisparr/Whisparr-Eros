import React, { useCallback } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { inputTypes } from 'Helpers/Props';
import { usePerformerIndexOption } from 'Performer/Index/performerIndexOptionsStore';
import translate from 'Utilities/String/translate';

interface PerformerIndexTableOptionsProps {
  onTableOptionChange(...args: unknown[]): unknown;
}

interface TableOptionInput {
  name: string;
  value: number | boolean | null;
}

function PerformerIndexTableOptions(props: PerformerIndexTableOptionsProps) {
  const { onTableOptionChange } = props;

  const tableOptions = usePerformerIndexOption('tableOptions');
  const { showSearchAction } = tableOptions;

  const onTableOptionChangeWrapper = useCallback(
    ({ name, value }: TableOptionInput) => {
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
    <div>
      <FormGroup>
        <FormLabel>{translate('TablePageSize')}</FormLabel>
        <FormInputGroup
          type={inputTypes.NUMBER}
          name="pageSize"
          value={tableOptions.pageSize}
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

      <FormGroup>
        <FormLabel>{translate('ShowSearch')}</FormLabel>
        <FormInputGroup
          type={inputTypes.CHECK}
          name="showSearchAction"
          value={showSearchAction}
          helpText={translate('ShowSearchHelpText')}
          onChange={onTableOptionChangeWrapper}
        />
      </FormGroup>
    </div>
  );
}

export default PerformerIndexTableOptions;
