import React from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputGroup from 'Components/Form/FormInputGroup';
import FormLabel from 'Components/Form/FormLabel';
import { inputTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

export interface CommonPosterOptions {
  detailedProgressBar: boolean;
  showMonitored: boolean;
  showQualityProfile: boolean;
  showReleaseDate: boolean;
  showSearchAction: boolean;
  showTitle: boolean;
  size: string;
}

export interface PosterOptionChange {
  name: string;
  value: unknown;
}

interface PosterOptionsFormProps {
  posterOptions: CommonPosterOptions;
  onPosterOptionChange(change: PosterOptionChange): void;
}

const posterSizeOptions = [
  {
    key: 'small',
    get value() {
      return translate('Small');
    },
  },
  {
    key: 'medium',
    get value() {
      return translate('Medium');
    },
  },
  {
    key: 'large',
    get value() {
      return translate('Large');
    },
  },
];

const checkboxOptions = [
  {
    name: 'detailedProgressBar',
    label: 'DetailedProgressBar',
    helpText: 'DetailedProgressBarHelpText',
  },
  {
    name: 'showTitle',
    label: 'ShowTitle',
    helpText: 'ShowTitleHelpText',
  },
  {
    name: 'showMonitored',
    label: 'ShowMonitored',
    helpText: 'ShowMonitoredHelpText',
  },
  {
    name: 'showQualityProfile',
    label: 'ShowQualityProfile',
    helpText: 'ShowQualityProfileHelpText',
  },
  {
    name: 'showReleaseDate',
    label: 'ShowReleaseDate',
    helpText: 'ShowReleaseDateHelpText',
  },
  {
    name: 'showSearchAction',
    label: 'ShowSearch',
    helpText: 'ShowSearchHelpText',
  },
] as const;

function PosterOptionsForm({
  posterOptions,
  onPosterOptionChange,
}: Readonly<PosterOptionsFormProps>) {
  return (
    <>
      <FormGroup>
        <FormLabel>{translate('PosterSize')}</FormLabel>
        <FormInputGroup
          type={inputTypes.SELECT}
          name="size"
          value={posterOptions.size}
          values={posterSizeOptions}
          onChange={onPosterOptionChange}
        />
      </FormGroup>

      {checkboxOptions.map(({ name, label, helpText }) => (
        <FormGroup key={name}>
          <FormLabel>{translate(label)}</FormLabel>
          <FormInputGroup
            type={inputTypes.CHECK}
            name={name}
            value={posterOptions[name]}
            helpText={translate(helpText)}
            onChange={onPosterOptionChange}
          />
        </FormGroup>
      ))}
    </>
  );
}

export default PosterOptionsForm;
