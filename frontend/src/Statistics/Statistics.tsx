import React, { useMemo } from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { kinds } from 'Helpers/Props';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import BarChart, { BarChartItem } from './Charts/BarChart';
import DoughnutChart, { DoughnutChartItem } from './Charts/DoughnutChart';
import StatisticsSummary, { SummaryTile } from './StatisticsSummary';
import useStatistics from './useStatistics';
import styles from './Statistics.css';

// Tags and quality profiles are bounded and arrive complete, so the chart shows the
// biggest few and folds the rest into one bucket. Studios and performers are already
// capped server-side -- the API sends the top entries only -- so those render as they
// arrive, with no "Other" bucket that would understate the remainder.
const TOP_N = 10;

function topItems<T>(
  items: T[],
  label: (item: T) => string,
  value: (item: T) => number
): BarChartItem[] {
  const sorted = [...items]
    .filter((item) => value(item) > 0)
    .sort((a, b) => value(b) - value(a));

  const top = sorted.slice(0, TOP_N).map((item) => ({
    label: label(item),
    value: value(item),
  }));

  const remainder = sorted.slice(TOP_N);

  if (remainder.length > 0) {
    top.push({
      label: translate('Other'),
      value: remainder.reduce((acc, item) => acc + value(item), 0),
    });
  }

  return top;
}

export default function Statistics() {
  const { data, isFetching, isLoading, error } = useStatistics();

  const summaryTiles = useMemo<SummaryTile[]>(() => {
    if (!data) {
      return [];
    }

    return [
      { label: translate('Movies'), value: data.movieCount.toLocaleString() },
      {
        label: translate('Monitored'),
        value: data.monitoredMovieCount.toLocaleString(),
      },
      {
        label: translate('Downloaded'),
        value: data.downloadedMovieCount.toLocaleString(),
      },
      {
        label: translate('Missing'),
        value: data.missingMovieCount.toLocaleString(),
      },
      {
        label: translate('Files'),
        value: data.movieFileCount.toLocaleString(),
      },
      { label: translate('SizeOnDisk'), value: formatBytes(data.sizeOnDisk) },
    ];
  }, [data]);

  const statusItems = useMemo<DoughnutChartItem[]>(() => {
    if (!data) {
      return [];
    }

    return [
      { label: translate('Released'), value: data.releasedMovieCount },
      { label: translate('InCinemas'), value: data.inCinemasMovieCount },
      { label: translate('Announced'), value: data.announcedMovieCount },
      { label: translate('Tba'), value: data.tbaMovieCount },
      { label: translate('Deleted'), value: data.deletedMovieCount },
    ].filter((item) => item.value > 0);
  }, [data]);

  const itemTypeItems = useMemo<DoughnutChartItem[]>(() => {
    if (!data) {
      return [];
    }

    return [
      { label: translate('Movies'), value: data.movieItemCount },
      { label: translate('Scenes'), value: data.sceneItemCount },
    ].filter((item) => item.value > 0);
  }, [data]);

  const qualityItems = useMemo<BarChartItem[]>(() => {
    if (!data) {
      return [];
    }

    return data.qualities
      .filter((quality) => quality.movieFileCount > 0)
      .map((quality) => ({
        label: quality.quality?.name ?? translate('Unknown'),
        value: quality.movieFileCount,
        tooltipLines: [formatBytes(quality.sizeOnDisk)],
      }));
  }, [data]);

  const qualityProfileItems = useMemo<BarChartItem[]>(() => {
    return data
      ? topItems(
          data.qualityProfiles,
          (profile) => profile.name,
          (profile) => profile.movieCount
        )
      : [];
  }, [data]);

  const tagItems = useMemo<BarChartItem[]>(() => {
    return data
      ? topItems(
          data.tags,
          (tag) => tag.label,
          (tag) => tag.movieCount
        )
      : [];
  }, [data]);

  const studioItems = useMemo<BarChartItem[]>(() => {
    return (data?.studios ?? []).slice(0, TOP_N).map((studio) => ({
      label: studio.title,
      value: studio.movieCount,
      tooltipLines: [formatBytes(studio.sizeOnDisk)],
    }));
  }, [data]);

  const performerItems = useMemo<BarChartItem[]>(() => {
    return (data?.performers ?? []).slice(0, TOP_N).map((performer) => ({
      label: performer.name,
      value: performer.movieCount,
      tooltipLines: [formatBytes(performer.sizeOnDisk)],
    }));
  }, [data]);

  return (
    <PageContent title={translate('Statistics')}>
      <PageContentBody>
        {isFetching && isLoading ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('StatisticsLoadError')}</Alert>
        ) : null}

        {!isLoading && !error && data ? (
          <>
            <StatisticsSummary tiles={summaryTiles} />

            <div className={styles.charts}>
              {statusItems.length > 0 ? (
                <div className={styles.chart}>
                  <DoughnutChart
                    title={translate('Status')}
                    items={statusItems}
                  />
                </div>
              ) : null}

              {itemTypeItems.length > 0 ? (
                <div className={styles.chart}>
                  <DoughnutChart
                    title={translate('Type')}
                    items={itemTypeItems}
                  />
                </div>
              ) : null}

              {qualityItems.length > 0 ? (
                <div className={styles.chart}>
                  <BarChart title={translate('Quality')} items={qualityItems} />
                </div>
              ) : null}

              {qualityProfileItems.length > 0 ? (
                <div className={styles.chart}>
                  <BarChart
                    title={translate('QualityProfiles')}
                    items={qualityProfileItems}
                  />
                </div>
              ) : null}

              {tagItems.length > 0 ? (
                <div className={styles.chart}>
                  <BarChart title={translate('Tags')} items={tagItems} />
                </div>
              ) : null}

              {studioItems.length > 0 ? (
                <div className={styles.chart}>
                  <BarChart title={translate('Studios')} items={studioItems} />
                </div>
              ) : null}

              {performerItems.length > 0 ? (
                <div className={styles.chart}>
                  <BarChart
                    title={translate('Performers')}
                    items={performerItems}
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </PageContentBody>
    </PageContent>
  );
}
