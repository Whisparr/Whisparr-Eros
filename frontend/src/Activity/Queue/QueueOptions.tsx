import React, { useCallback } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import usePage from 'Helpers/Hooks/usePage';
import { inputTypes } from 'Helpers/Props';
import { InputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import { setQueueOption, useQueueOption } from './queueOptionsStore';

function QueueOptions() {
  const includeUnknownMovieItems = useQueueOption('includeUnknownMovieItems');
  const { goToPage } = usePage('queue');

  const handleOptionChange = useCallback(
    ({ name, value }: InputChanged<boolean>) => {
      setQueueOption(name as 'includeUnknownMovieItems', value);

      if (name === 'includeUnknownMovieItems') {
        goToPage(1);
      }
    },
    [goToPage]
  );

  return (
    <FormGroup>
      <FormLabel>{translate('ShowUnknownMovieItems')}</FormLabel>

      <FormInputGroup
        type={inputTypes.CHECK}
        name="includeUnknownMovieItems"
        value={includeUnknownMovieItems}
        helpText={translate('ShowUnknownMovieItemsHelpText')}
        onChange={handleOptionChange}
      />
    </FormGroup>
  );
}

export default QueueOptions;
