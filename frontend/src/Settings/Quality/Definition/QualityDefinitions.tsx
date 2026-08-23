import React, { useEffect } from 'react';
import FieldSet from 'Components/FieldSet';
import PageSectionContent from 'Components/Page/PageSectionContent';
import useShowAdvancedSettings from 'Helpers/Hooks/useShowAdvancedSettings';
import {
  OnChildStateChange,
  SetChildSave,
} from 'typings/Settings/SettingsState';
import translate from 'Utilities/String/translate';
import QualityDefinition from './QualityDefinition';
import { useManageQualityDefinitions } from './useQualityDefinitions';
import styles from './QualityDefinitions.css';

interface QualityDefinitionsProps {
  setChildSave: SetChildSave;
  onChildStateChange: OnChildStateChange;
}

function QualityDefinitions({
  setChildSave,
  onChildStateChange,
}: Readonly<QualityDefinitionsProps>) {
  const advancedSettings = useShowAdvancedSettings();

  const {
    items,
    isFetching,
    isFetched,
    isSaving,
    error,
    hasPendingChanges,
    updateDefinition,
    saveQualityDefinitions,
  } = useManageQualityDefinitions();

  useEffect(() => {
    setChildSave(saveQualityDefinitions);
  }, [saveQualityDefinitions, setChildSave]);

  useEffect(() => {
    onChildStateChange({ isSaving, hasPendingChanges });
  }, [hasPendingChanges, isSaving, onChildStateChange]);

  return (
    <FieldSet legend={translate('QualityDefinitions')}>
      <PageSectionContent
        errorMessage={translate('QualityDefinitionsLoadError')}
        isFetching={isFetching}
        isPopulated={isFetched}
        error={error ?? undefined}
      >
        <div className={styles.header}>
          <div className={styles.quality}>{translate('Quality')}</div>
          <div className={styles.title}>{translate('Title')}</div>
          <div className={styles.sizeLimit}>{translate('SizeLimit')}</div>

          {advancedSettings ? (
            <div className={styles.megabytesPerMinute}>
              {translate('MegabytesPerMinute')}
            </div>
          ) : null}
        </div>

        <div className={styles.definitions}>
          {items.map((item) => {
            return (
              <QualityDefinition
                key={item.id}
                {...item}
                advancedSettings={advancedSettings}
                updateDefinition={updateDefinition}
              />
            );
          })}
        </div>

        <div className={styles.sizeLimitHelpTextContainer}>
          <div className={styles.sizeLimitHelpText}>
            {translate('QualityLimitsMovieRuntimeHelpText')}
          </div>
        </div>
      </PageSectionContent>
    </FieldSet>
  );
}

export default QualityDefinitions;
