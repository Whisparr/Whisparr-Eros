import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

export interface SceneStatusDetails {
  icon: IconDefinition;
  title: string;
  message: string;
}

export function getSceneStatusDetails(status: string): SceneStatusDetails {
  let statusDetails: SceneStatusDetails = {
    icon: icons.ANNOUNCED,
    title: translate('Announced'),
    message: translate('Announced'),
  };

  if (status === 'deleted') {
    statusDetails = {
      icon: icons.MOVIE_DELETED,
      title: translate('Deleted'),
      message: translate('DeletedMsg'),
    };
  } else if (status === 'released') {
    statusDetails = {
      icon: icons.MOVIE_FILE,
      title: translate('Released'),
      message: translate('ReleasedMsg'),
    };
  }

  return statusDetails;
}
