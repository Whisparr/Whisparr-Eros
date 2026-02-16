import React, { useContext } from 'react';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './SafeForWorkButton.css';

export interface SafeForWorkButtonProps {
  onSafeForWorkModePress: () => void;
}

function SafeForWorkButton({ onSafeForWorkModePress }: SafeForWorkButtonProps) {
  const safeForWorkMode = useContext(SafeForWorkModeContext);

  return (
    <Link
      className={styles.button}
      title={
        safeForWorkMode
          ? translate('HiddenClickToShow')
          : translate('ShownClickToHide')
      }
      onPress={onSafeForWorkModePress}
    >
      <Icon name={safeForWorkMode ? icons.SFW : icons.NSFW} size={21} />
    </Link>
  );
}

export default SafeForWorkButton;
