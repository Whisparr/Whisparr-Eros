import classNames from 'classnames';
import React from 'react';
import { ColorImpairedConsumer } from 'App/ColorImpairedContext';
import Alert from 'Components/Alert';
import DescriptionList from 'Components/DescriptionList/DescriptionList';
import DescriptionListItem from 'Components/DescriptionList/DescriptionListItem';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import { useSceneStats } from './useSceneStats';
import styles from './SceneIndexFooter.css';

export default function SceneIndexFooter() {
  const { data, isFetching, isError, error } = useSceneStats();

  const count = data?.totalCount ?? 0;
  const movieFiles = data?.movieFiles ?? 0;
  const monitored = data?.monitoredCount ?? 0;
  const totalFileSize = data?.totalFileSize ?? 0;

  if (isError) {
    return (
      <Alert kind="danger">
        {`${translate('FailedToLoadIndexFooter:')} ${error?.message}`}
      </Alert>
    );
  }
  if (isFetching) {
    return <LoadingIndicator />;
  }

  return (
    <ColorImpairedConsumer>
      {(enableColorImpairedMode) => {
        return (
          <div className={styles.footer}>
            <div>
              <div className={styles.legendItem}>
                <div className={styles.ended} />
                <div>{translate('DownloadedAndMonitored')}</div>
              </div>

              <div className={styles.legendItem}>
                <div className={styles.availNotMonitored} />
                <div>{translate('DownloadedButNotMonitored')}</div>
              </div>

              <div className={styles.legendItem}>
                <div
                  className={classNames(
                    styles.missingMonitored,
                    enableColorImpairedMode && 'colorImpaired'
                  )}
                />
                <div>{translate('MissingMonitoredAndConsideredAvailable')}</div>
              </div>

              <div className={styles.legendItem}>
                <div
                  className={classNames(
                    styles.missingUnmonitored,
                    enableColorImpairedMode && 'colorImpaired'
                  )}
                />
                <div>{translate('MissingNotMonitored')}</div>
              </div>

              <div className={styles.legendItem}>
                <div className={styles.queue} />
                <div>{translate('Queued')}</div>
              </div>

              <div className={styles.legendItem}>
                <div className={styles.continuing} />
                <div>{translate('Unreleased')}</div>
              </div>
            </div>

            <div className={styles.statistics}>
              <DescriptionList>
                <DescriptionListItem title={translate('Scenes')} data={count} />

                <DescriptionListItem
                  title={translate('SceneFiles')}
                  data={movieFiles}
                />
              </DescriptionList>

              <DescriptionList>
                <DescriptionListItem
                  title={translate('Monitored')}
                  data={monitored}
                />

                <DescriptionListItem
                  title={translate('Unmonitored')}
                  data={count - monitored}
                />
              </DescriptionList>

              <DescriptionList>
                <DescriptionListItem
                  title={translate('TotalFileSize')}
                  data={formatBytes(totalFileSize)}
                />
              </DescriptionList>
            </div>
          </div>
        );
      }}
    </ColorImpairedConsumer>
  );
}
