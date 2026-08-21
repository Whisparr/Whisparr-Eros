import React, { useCallback, useEffect } from 'react';
import { useAppValues } from 'App/appStore';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import MarkdownRenderer from 'Components/Markdown/MarkdownRenderer';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import usePrevious from 'Helpers/Hooks/usePrevious';
import { kinds } from 'Helpers/Props';
import UpdateChanges from 'System/Updates/UpdateChanges';
import useUpdates from 'System/Updates/useUpdates';
import Update from 'typings/Update';
import translate from 'Utilities/String/translate';
import styles from './AppUpdatedModalContent.css';

function mergeUpdates(
  items: readonly Update[],
  version: string,
  prevVersion?: string
) {
  let installedIndex = items.findIndex((u) => u.version === version);
  let installedPreviouslyIndex = items.findIndex(
    (u) => u.version === prevVersion
  );

  if (installedIndex === -1) {
    installedIndex = 0;
  }

  if (installedPreviouslyIndex === -1) {
    installedPreviouslyIndex = items.length;
  } else if (installedPreviouslyIndex === installedIndex && items.length) {
    installedPreviouslyIndex += 1;
  }

  const appliedUpdates = items.slice(installedIndex, installedPreviouslyIndex);

  if (!appliedUpdates.length) {
    return null;
  }

  // Only merge if all are objects, otherwise just use the first string
  if (
    appliedUpdates.every(
      (u) => typeof u.changes === 'object' && u.changes !== null
    )
  ) {
    const appliedChanges: Update['changes'] = { new: [], fixed: [] };
    appliedUpdates.forEach((u: Update) => {
      if (u.changes && typeof u.changes === 'object') {
        appliedChanges.new.push(...u.changes.new);
        appliedChanges.fixed.push(...u.changes.fixed);
      }
    });
    const mergedUpdate: Update = Object.assign({}, appliedUpdates[0], {
      changes: appliedChanges,
    });
    if (!appliedChanges.new.length && !appliedChanges.fixed.length) {
      mergedUpdate.changes = null;
    }
    return mergedUpdate;
  } else if (
    appliedUpdates[0] &&
    typeof appliedUpdates[0].changes === 'string'
  ) {
    // Just use the first string markdown
    return appliedUpdates[0];
  }
  return null;
}

interface AppUpdatedModalContentProps {
  onModalClose: () => void;
}

function AppUpdatedModalContent(props: AppUpdatedModalContentProps) {
  const { version, prevVersion } = useAppValues('version', 'prevVersion');
  const { data: items, isFetched: isPopulated, error, refetch } = useUpdates();
  const previousVersion = usePrevious(version);

  const { onModalClose } = props;

  const update = mergeUpdates(items, version, prevVersion);

  const handleSeeChangesPress = useCallback(() => {
    window.location.href = `${window.Whisparr.urlBase}/system/updates`;
  }, []);

  useEffect(() => {
    if (version !== previousVersion) {
      refetch();
    }
  }, [version, previousVersion, refetch]);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('AppUpdated')}</ModalHeader>

      <ModalBody>
        <div>
          <InlineMarkdown
            data={translate('AppUpdatedVersion', { version })}
            blockClassName={styles.version}
          />
        </div>

        {isPopulated && !error ? (
          <div>
            {(() => {
              if (!update?.changes) {
                const branch = update?.branch ?? items[0]?.branch;
                return (
                  <InlineMarkdown
                    data={translate('MaintenanceReleaseWithLink', {
                      url: `https://github.com/Whisparr/Whisparr-Eros/commits/${branch}`,
                    })}
                  />
                );
              }
              if (typeof update.changes === 'string') {
                return <MarkdownRenderer>{update.changes}</MarkdownRenderer>;
              }
              return (
                <div>
                  <div className={styles.changes}>{translate('WhatsNew')}</div>
                  <UpdateChanges
                    title={translate('New')}
                    changes={update.changes.new}
                  />
                  <UpdateChanges
                    title={translate('Fixed')}
                    changes={update.changes.fixed}
                  />
                </div>
              );
            })()}
          </div>
        ) : null}

        {!isPopulated && !error ? <LoadingIndicator /> : null}
      </ModalBody>

      <ModalFooter>
        <Button onPress={handleSeeChangesPress}>
          {translate('RecentChanges')}
        </Button>

        <Button kind={kinds.PRIMARY} onPress={onModalClose}>
          {translate('Reload')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default AppUpdatedModalContent;
