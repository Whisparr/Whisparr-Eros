import React, { useCallback, useContext } from 'react';
import { toggleSafeForWorkMode } from 'App/safeForWorkStore';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './SafeForWorkButton.css';

function SafeForWorkButton() {
  const safeForWorkMode = useContext(SafeForWorkModeContext);

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
