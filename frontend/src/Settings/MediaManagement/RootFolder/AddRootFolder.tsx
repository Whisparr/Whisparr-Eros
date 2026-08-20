import React, { useCallback, useMemo, useState } from 'react';
import Alert from 'Components/Alert';
import FileBrowserModal from 'Components/FileBrowser/FileBrowserModal';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import { getValidationFailures } from 'Helpers/Hooks/useApiMutation';
import { icons, kinds, sizes } from 'Helpers/Props';
import { useAddRootFolder } from 'RootFolder/useRootFolders';
import translate from 'Utilities/String/translate';
import styles from './AddRootFolder.css';

function AddRootFolder() {
  const { addRootFolder, isAddingRootFolder, addRootFolderError } =
    useAddRootFolder();

  // A rejected path comes back as a 400 carrying validation failures; anything
  // else has no per-field detail to show, so it falls back to the raw body.
  const addFailures = useMemo(
    () => getValidationFailures(addRootFolderError).errors,
    [addRootFolderError]
  );

  const [isAddNewRootFolderModalOpen, setIsAddNewRootFolderModalOpen] =
    useState(false);

  const onAddNewRootFolderPress = useCallback(() => {
    setIsAddNewRootFolderModalOpen(true);
  }, [setIsAddNewRootFolderModalOpen]);

  const onNewRootFolderSelect = useCallback(
    ({ value }: { value: string }) => {
      addRootFolder({ path: value });
    },
    [addRootFolder]
  );

  const onAddRootFolderModalClose = useCallback(() => {
    setIsAddNewRootFolderModalOpen(false);
  }, [setIsAddNewRootFolderModalOpen]);

  return (
    <>
      {!isAddingRootFolder && addRootFolderError ? (
        <Alert kind={kinds.DANGER}>
          {translate('AddRootFolderError')}

          <ul>
            {addFailures.length ? (
              addFailures.map((e, index) => {
                return <li key={index}>{e.errorMessage}</li>;
              })
            ) : (
              <li>{JSON.stringify(addRootFolderError.statusBody)}</li>
            )}
          </ul>
        </Alert>
      ) : null}

      <div className={styles.addRootFolderButtonContainer}>
        <Button
          kind={kinds.PRIMARY}
          size={sizes.LARGE}
          onPress={onAddNewRootFolderPress}
        >
          <Icon className={styles.importButtonIcon} name={icons.DRIVE} />
          {translate('AddRootFolder')}
        </Button>

        <FileBrowserModal
          isOpen={isAddNewRootFolderModalOpen}
          name="rootFolderPath"
          value=""
          onChange={onNewRootFolderSelect}
          onModalClose={onAddRootFolderModalClose}
        />
      </div>
    </>
  );
}

export default AddRootFolder;
