import React, { useCallback, useEffect, useState } from 'react';
import FormInputGroup from 'Components/Form/FormInputGroup';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContentFooter from 'Components/Page/PageContentFooter';
import Popover from 'Components/Tooltip/Popover';
import { icons, inputTypes, kinds, tooltipPositions } from 'Helpers/Props';
import { ApiError } from 'Utilities/Fetch/fetchJson';
import translate from 'Utilities/String/translate';
import { ImportItem } from '../ImportMovieTypes';
import styles from './ImportMovieFooter.css';

const MIXED = 'mixed';

function isMixed(
  items: ImportItem[],
  selectedIds: string[],
  key: 'monitor' | 'qualityProfileId',
  defaultValue: string | number
): boolean {
  return items.some(
    (item) => selectedIds.includes(item.id) && item[key] !== defaultValue
  );
}

interface ImportMovieFooterProps {
  items: ImportItem[];
  selectedIds: string[];
  defaultMonitor: string;
  defaultQualityProfileId: number;
  isLookingUp: boolean;
  isImporting: boolean;
  importError: ApiError | null;
  onInputChange: (opts: { name: string; value: string | number }) => void;
  onImportPress: () => void;
  onLookupUnsearched: () => void;
  onCancelLookup: () => void;
}

function ImportMovieFooter({
  items,
  selectedIds,
  defaultMonitor,
  defaultQualityProfileId,
  isLookingUp,
  isImporting,
  importError,
  onInputChange,
  onImportPress,
  onLookupUnsearched,
  onCancelLookup,
}: Readonly<ImportMovieFooterProps>) {
  const selectedCount = selectedIds.length;
  const isMonitorMixed = isMixed(items, selectedIds, 'monitor', defaultMonitor);
  const isQualityProfileIdMixed = isMixed(
    items,
    selectedIds,
    'qualityProfileId',
    defaultQualityProfileId
  );
  const hasUnsearchedItems =
    !isLookingUp && items.some((item) => !item.isPopulated);

  const [monitor, setMonitor] = useState<string>(defaultMonitor);
  const [qualityProfileId, setQualityProfileId] = useState<number | string>(
    defaultQualityProfileId
  );

  useEffect(() => {
    if (isMonitorMixed) {
      setMonitor(MIXED);
    } else if (monitor !== defaultMonitor) {
      setMonitor(defaultMonitor);
    }
  }, [defaultMonitor, isMonitorMixed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isQualityProfileIdMixed) {
      setQualityProfileId(MIXED);
    } else if (qualityProfileId !== defaultQualityProfileId) {
      setQualityProfileId(defaultQualityProfileId);
    }
  }, [defaultQualityProfileId, isQualityProfileIdMixed]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = useCallback(
    ({ name, value }: { name: string; value: string | number }) => {
      if (name === 'monitor') {
        setMonitor(value as string);
      } else if (name === 'qualityProfileId') {
        setQualityProfileId(value);
      }
      onInputChange({ name, value });
    },
    [onInputChange]
  );

  const importErrorBody =
    importError?.statusBody && Array.isArray(importError.statusBody)
      ? (importError.statusBody as { errorMessage: string }[])
      : null;

  return (
    <PageContentFooter>
      <div className={styles.inputContainer}>
        <div className={styles.label}>{translate('Monitor')}</div>

        <FormInputGroup
          type={inputTypes.MONITOR_MOVIES_SELECT}
          name="monitor"
          value={monitor}
          isDisabled={!selectedCount}
          includeMixed={isMonitorMixed}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.inputContainer}>
        <div className={styles.label}>{translate('QualityProfile')}</div>

        <FormInputGroup
          type={inputTypes.QUALITY_PROFILE_SELECT}
          name="qualityProfileId"
          value={qualityProfileId}
          isDisabled={!selectedCount}
          includeMixed={isQualityProfileIdMixed}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <div className={styles.label}>&nbsp;</div>

        <div className={styles.importButtonContainer}>
          <SpinnerButton
            className={styles.importButton}
            kind={kinds.PRIMARY}
            isSpinning={isImporting}
            isDisabled={!selectedCount || isLookingUp}
            onPress={onImportPress}
          >
            {translate('Import')} {selectedCount}{' '}
            {selectedCount > 1 ? translate('Files') : translate('File')}
          </SpinnerButton>

          {isLookingUp ? (
            <Button
              className={styles.loadingButton}
              kind={kinds.WARNING}
              onPress={onCancelLookup}
            >
              {translate('CancelProcessing')}
            </Button>
          ) : null}

          {hasUnsearchedItems ? (
            <Button
              className={styles.loadingButton}
              kind={kinds.SUCCESS}
              onPress={onLookupUnsearched}
            >
              {translate('StartProcessing')}
            </Button>
          ) : null}

          {isLookingUp ? (
            <LoadingIndicator className={styles.loading} size={24} />
          ) : null}

          {isLookingUp ? translate('ProcessingFolders') : null}

          {importError ? (
            <Popover
              anchor={
                <Icon
                  className={styles.importError}
                  name={icons.WARNING}
                  kind={kinds.WARNING}
                />
              }
              title={translate('ImportErrors')}
              body={
                <ul>
                  {importErrorBody ? (
                    importErrorBody.map((e) => (
                      <li key={e.errorMessage}>{e.errorMessage}</li>
                    ))
                  ) : (
                    <li>{JSON.stringify(importError.statusBody)}</li>
                  )}
                </ul>
              }
              position={tooltipPositions.RIGHT}
            />
          ) : null}
        </div>
      </div>
    </PageContentFooter>
  );
}

export default ImportMovieFooter;
