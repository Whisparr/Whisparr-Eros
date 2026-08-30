import React, { useCallback } from 'react';
import {
  toggleSafeForWorkMode,
  useSafeForWorkMode,
} from 'App/safeForWorkStore';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './SafeForWorkButton.css';

function SafeForWorkButton() {
  const safeForWorkMode = useSafeForWorkMode();

  const handlePress = useCallback(() => {
    toggleSafeForWorkMode();
  }, []);

  return (
    <Link
      className={styles.button}
      title={
        safeForWorkMode
          ? translate('HiddenClickToShow')
          : translate('ShownClickToHide')
      }
      onPress={handlePress}
    >
      <Icon name={safeForWorkMode ? icons.SFW : icons.NSFW} size={21} />
    </Link>
  );
}

export default SafeForWorkButton;
