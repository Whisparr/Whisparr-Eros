import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

export interface PerformerStatusDetails {
  icon: IconDefinition;
  title: string;
  message: string;
}

export function getPerformerStatusDetails(
  status: string
): PerformerStatusDetails {
  let statusDetails: PerformerStatusDetails = {
    icon: icons.MOVIE_CONTINUING,
    title: translate('Active'),
    message: translate('ActivePerformerDescription'),
  };

  if (status === 'inactive') {
    statusDetails = {
      icon: icons.SERIES_ENDED,
      title: translate('Inactive'),
      message: translate('InactivePerformerDescription'),
    };
  }

  if (status === 'unknown') {
    statusDetails = {
      icon: icons.SERIES_ENDED,
      title: translate('Unknown'),
      message: translate('UnknownPerformerDescription'),
    };
  }

  return statusDetails;
}
