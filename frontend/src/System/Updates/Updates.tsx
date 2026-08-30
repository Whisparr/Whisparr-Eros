import React, { useCallback, useMemo, useState } from 'react';
import { useAppValue } from 'App/appStore';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import SpinnerButton from 'Components/Link/SpinnerButton';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import { useGeneralSettings } from 'Settings/General/useGeneralSettings';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import { useSystemStatusData } from 'System/Status/useSystemStatus';
import { UpdateMechanism } from 'typings/Settings/General';
import formatDate from 'Utilities/Date/formatDate';
import formatDateTime from 'Utilities/Date/formatDateTime';
import translate from 'Utilities/String/translate';
import UpdateChanges from './UpdateChanges';
import useUpdates from './useUpdates';
import styles from './Updates.css';

const VERSION_REGEX = /\d+\.\d+\.\d+\.\d+/i;

function Updates() {
  const currentVersion = useAppValue('version');
  const { packageUpdateMechanismMessage } = useSystemStatusData();
  const { shortDateFormat, longDateFormat, timeFormat } = useUiSettingsValues();
  const isInstallingUpdate = useCommandExecuting(
    commandNames.APPLICATION_UPDATE
  );

  const {
    data: items,
    isFetching: isFetchingUpdates,
    isFetched: isUpdatesFetched,
    error: updatesError,
  } = useUpdates();

  // The update mechanism is a general setting, and it decides which of the
  // external-updater messages this page shows.
  const {
    data: generalSettings,
    isFetching: isFetchingGeneralSettings,
    isFetched: isGeneralSettingsFetched,
    error: generalSettingsError,
  } = useGeneralSettings();

  const updateMechanism = generalSettings.updateMechanism;

  const isFetching = isFetchingUpdates || isFetchingGeneralSettings;
  const isPopulated = isUpdatesFetched && isGeneralSettingsFetched;

  const executeCommand = useExecuteCommand();
  const [isMajorUpdateModalOpen, setIsMajorUpdateModalOpen] = useState(false);
  const hasError = !!(updatesError || generalSettingsError);
  const hasUpdates = isPopulated && !hasError && items.length > 0;
  const noUpdates = isPopulated && !hasError && !items.length;

  const externalUpdaterPrefix = translate('UpdateAppDirectlyLoadError');
  const externalUpdaterMessages: Partial<Record<UpdateMechanism, string>> = {
    external: translate('ExternalUpdater'),
    apt: translate('AptUpdater'),
    docker: translate('DockerUpdater'),
  };

  const { isMajorUpdate, hasUpdateToInstall } = useMemo(() => {
    const majorVersion = Number.parseInt(
      currentVersion.match(VERSION_REGEX)?.[0] ?? '0',
      10
    );

    const latestVersion = items[0]?.version;
    const latestMajorVersion = Number.parseInt(
      latestVersion?.match(VERSION_REGEX)?.[0] ?? '0',
      10
    );

    return {
      isMajorUpdate: latestMajorVersion > majorVersion,
      hasUpdateToInstall: items.some(
        (update) => update.installable && update.latest
      ),
    };
  }, [currentVersion, items]);

  const noUpdateToInstall = hasUpdates && !hasUpdateToInstall;

  const handleInstallLatestPress = useCallback(() => {
    if (isMajorUpdate) {
      setIsMajorUpdateModalOpen(true);
    } else {
      executeCommand({ name: commandNames.APPLICATION_UPDATE });
    }
  }, [isMajorUpdate, setIsMajorUpdateModalOpen, executeCommand]);

  const handleInstallLatestMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);

    executeCommand({
      name: commandNames.APPLICATION_UPDATE,
      installMajorUpdate: true,
    });
  }, [setIsMajorUpdateModalOpen, executeCommand]);

  const handleCancelMajorVersionPress = useCallback(() => {
    setIsMajorUpdateModalOpen(false);
  }, [setIsMajorUpdateModalOpen]);

  return (
    <PageContent title={translate('Updates')}>
      <PageContentBody>
        {isPopulated || hasError ? null : <LoadingIndicator />}

        {noUpdates ? (
          <Alert kind={kinds.INFO}>{translate('NoUpdatesAreAvailable')}</Alert>
        ) : null}

        {hasUpdateToInstall ? (
          <div className={styles.messageContainer}>
            {updateMechanism === 'builtIn' || updateMechanism === 'script' ? (
              <SpinnerButton
                kind={kinds.PRIMARY}
                isSpinning={isInstallingUpdate}
                onPress={handleInstallLatestPress}
              >
                {translate('InstallLatest')}
              </SpinnerButton>
            ) : (
              <>
                <Icon name={icons.WARNING} kind={kinds.WARNING} size={30} />

                <div className={styles.message}>
                  {externalUpdaterPrefix}{' '}
                  <InlineMarkdown
                    data={
                      packageUpdateMechanismMessage ||
                      externalUpdaterMessages[updateMechanism] ||
                      externalUpdaterMessages.external
                    }
                  />
                </div>
              </>
            )}

            {isFetching ? (
              <LoadingIndicator className={styles.loading} size={20} />
            ) : null}
          </div>
        ) : null}

        {noUpdateToInstall && (
          <div className={styles.messageContainer}>
            <Icon
              className={styles.upToDateIcon}
              name={icons.CHECK_CIRCLE}
              size={30}
            />
            <div className={styles.message}>{translate('OnLatestVersion')}</div>

            {isFetching && (
              <LoadingIndicator className={styles.loading} size={20} />
            )}
          </div>
        )}

        {hasUpdates && (
          <div>
            {items.map((update) => {
              return (
                <div key={update.version} className={styles.update}>
                  <div className={styles.info}>
                    <div className={styles.version}>{update.version}</div>
                    <div className={styles.space}>&mdash;</div>
                    <div
                      className={styles.date}
                      title={formatDateTime(
                        update.releaseDate,
                        longDateFormat,
                        timeFormat
                      )}
                    >
                      {formatDate(update.releaseDate, shortDateFormat)}
                    </div>

                    {update.branch === 'eros' ? null : (
                      <Label className={styles.label}>{update.branch}</Label>
                    )}

                    {update.version === currentVersion ? (
                      <Label
                        className={styles.label}
                        kind={kinds.SUCCESS}
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('CurrentlyInstalled')}
                      </Label>
                    ) : null}

                    {update.version !== currentVersion && update.installedOn ? (
                      <Label
                        className={styles.label}
                        kind={kinds.INVERSE}
                        title={formatDateTime(
                          update.installedOn,
                          longDateFormat,
                          timeFormat
                        )}
                      >
                        {translate('PreviouslyInstalled')}
                      </Label>
                    ) : null}
                  </div>

                  {/* Render release notes, or maintenance URL as fallback */}
                  {(() => {
                    if (
                      update.changes &&
                      typeof update.changes !== 'string' &&
                      Array.isArray((update.changes as { new?: unknown }).new)
                    ) {
                      const nonEmptyLines = (
                        (update.changes as { new?: unknown }).new as string[]
                      ).filter(
                        (line: string) =>
                          typeof line === 'string' && line.trim() !== ''
                      );
                      if (nonEmptyLines.length > 0) {
                        return (
                          <div>
                            <UpdateChanges
                              title={translate('New')}
                              changes={nonEmptyLines}
                            />
                          </div>
                        );
                      }
                    }
                    return (
                      <InlineMarkdown
                        data={translate('MaintenanceReleaseWithLink', {
                          url: `https://github.com/Whisparr/Whisparr-Eros/commits/${update.branch}`,
                        })}
                      />
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}

        {updatesError ? (
          <Alert kind={kinds.WARNING}>
            {translate('FailedToFetchUpdates')}
          </Alert>
        ) : null}

        {generalSettingsError ? (
          <Alert kind={kinds.DANGER}>
            {translate('FailedToUpdateSettings')}
          </Alert>
        ) : null}

        <ConfirmModal
          isOpen={isMajorUpdateModalOpen}
          kind={kinds.WARNING}
          title={translate('InstallMajorVersionUpdate')}
          message={
            <div>
              <div>{translate('InstallMajorVersionUpdateMessage')}</div>
              <div>
                <InlineMarkdown
                  data={translate('InstallMajorVersionUpdateMessageLink', {
                    domain: 'whisparr.com',
                    url: 'https://whisparr.com/#downloads',
                  })}
                />
              </div>
            </div>
          }
          confirmLabel={translate('Install')}
          onConfirm={handleInstallLatestMajorVersionPress}
          onCancel={handleCancelMajorVersionPress}
        />
      </PageContentBody>
    </PageContent>
  );
}

export default Updates;
