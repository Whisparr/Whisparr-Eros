import React from 'react';
import Alert from 'Components/Alert';
import FieldSet from 'Components/FieldSet';
import IconButton from 'Components/Link/IconButton';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import PageSectionContent from 'Components/Page/PageSectionContent';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import EditRemotePathMappingModal from './EditRemotePathMappingModal';
import RemotePathMapping from './RemotePathMapping';
import { useRemotePathMappings } from './useRemotePathMappings';
import styles from './RemotePathMappings.css';

function RemotePathMappings() {
  const { data, isFetching, isFetched, error } = useRemotePathMappings();

  const [
    isAddRemotePathMappingModalOpen,
    setAddRemotePathMappingModalOpen,
    setAddRemotePathMappingModalClosed,
  ] = useModalOpenState(false);

  return (
    <FieldSet legend={translate('RemotePathMappings')}>
      <PageSectionContent
        errorMessage={translate('RemotePathMappingsLoadError')}
        isFetching={isFetching}
        isPopulated={isFetched}
        error={error ?? undefined}
      >
        <Alert kind={kinds.INFO}>
          <InlineMarkdown
            data={translate('RemotePathMappingsInfo', {
              wikiLink:
                'https://wiki.servarr.com/whisparr/settings#remote-path-mappings',
            })}
          />
        </Alert>

        <div className={styles.remotePathMappingsHeader}>
          <div className={styles.host}>{translate('Host')}</div>
          <div className={styles.path}>{translate('RemotePath')}</div>
          <div className={styles.path}>{translate('LocalPath')}</div>
        </div>

        <div>
          {data.map((item) => {
            return <RemotePathMapping key={item.id} {...item} />;
          })}
        </div>

        <div className={styles.addRemotePathMapping}>
          <IconButton
            className={styles.addButton}
            name={icons.ADD}
            aria-label={translate('AddRemotePathMapping')}
            title={translate('AddRemotePathMapping')}
            onPress={setAddRemotePathMappingModalOpen}
          />
        </div>

        <EditRemotePathMappingModal
          isOpen={isAddRemotePathMappingModalOpen}
          onModalClose={setAddRemotePathMappingModalClosed}
        />
      </PageSectionContent>
    </FieldSet>
  );
}

export default RemotePathMappings;
