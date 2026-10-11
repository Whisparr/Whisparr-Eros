import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ProtocolLabel from 'Activity/Queue/ProtocolLabel';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import Popover from 'Components/Tooltip/Popover';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import MovieFormats from 'Movie/MovieFormats';
import MovieLanguages from 'Movie/MovieLanguages';
import MovieQuality from 'Movie/MovieQuality';
import { useMovie } from 'Movie/useMovie';
import { useImportListExclusionByForeignId } from 'Settings/ImportLists/ImportListExclusions/useImportListExclusions';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import Release from 'typings/Release';
import formatDateTime from 'Utilities/Date/formatDateTime';
import formatAge from 'Utilities/Number/formatAge';
import formatBytes from 'Utilities/Number/formatBytes';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import camelCaseToString from 'Utilities/String/camelCaseToString';
import translate from 'Utilities/String/translate';
import InteractiveSearchPayload from './InteractiveSearchPayload';
import OverrideMatchModal from './OverrideMatch/OverrideMatchModal';
import Peers from './Peers';
import { useGrabRelease } from './useReleases';
import styles from './InteractiveSearchRow.module.css';

function getDownloadIcon(
  isGrabbing: boolean,
  isGrabbed: boolean,
  grabError?: string
) {
  if (isGrabbing) {
    return icons.SPINNER;
  } else if (isGrabbed) {
    return icons.DOWNLOADING;
  } else if (grabError) {
    return icons.DOWNLOADING;
  }

  return icons.DOWNLOAD;
}

function getDownloadKind(isGrabbed: boolean, grabError?: string) {
  if (isGrabbed) {
    return kinds.SUCCESS;
  }

  if (grabError) {
    return kinds.DANGER;
  }

  return kinds.DEFAULT;
}

function getDownloadTooltip(
  isGrabbing: boolean,
  isGrabbed: boolean,
  grabError?: string
) {
  if (isGrabbing) {
    return '';
  } else if (isGrabbed) {
    return translate('AddedToDownloadQueue');
  } else if (grabError) {
    return grabError;
  }

  return translate('AddToDownloadQueue');
}

// Whether the searched item is excluded from import lists. Unlike the grab and
// blocklist state each release carries, this is a fact about the item, not the
// release, so it marks every row the same way -- an exclusion and a grab are
// separate decisions that can disagree, and the search is where that shows up.
//
// The exclusions table is keyed by foreign ID rather than movie id, hence the
// hop through the movie. Both requests are already in flight for the search:
// the modal that opened it reads the same movie, and the exclusion is keyed by
// a value every row shares.
function useMovieExclusion(movieId: number) {
  const { data: movie } = useMovie(movieId);
  const { data: exclusion } = useImportListExclusionByForeignId(
    movie?.foreignId
  );

  return exclusion;
}

interface InteractiveSearchRowProps extends Release {
  index: number;
  style: React.CSSProperties;
  setRowHeight: (index: number, height: number) => void;
  searchPayload: InteractiveSearchPayload;
}

function InteractiveSearchRow(props: Readonly<InteractiveSearchRowProps>) {
  const {
    guid,
    indexerId,
    protocol,
    age,
    ageHours,
    ageMinutes,
    publishDate,
    title,
    infoUrl,
    indexer,
    size,
    seeders,
    leechers,
    quality,
    history,
    languages,
    customFormatScore,
    customFormats,
    mappedMovieId,
    indexerFlags = [],
    rejections = [],
    downloadAllowed,
    index,
    style,
    setRowHeight,
    searchPayload,
  } = props;

  const rowRef = useRef<HTMLDivElement>(null);

  // Rows wrap to fit long titles and rejection lists, so the list can't know
  // their height up front. Each row reports what it actually rendered at.
  useLayoutEffect(() => {
    const element = rowRef.current;

    if (!element) {
      return;
    }

    const measure = () => setRowHeight(index, element.offsetHeight);

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [index, setRowHeight]);

  // One grab per row. The override modal below is handed this same instance, so
  // whichever button starts the grab, both report it.
  const { grabRelease, isGrabbing, isGrabbed, grabError } = useGrabRelease();

  const { longDateFormat, timeFormat, timeZone } = useUiSettingsValues();

  // The server matches a grab to this release and says so on `history`; a
  // blocklisted release is one the decision engine rejected for it.
  const isBlocklisted = useMemo(
    () =>
      rejections.some((reason) => reason.toLowerCase().includes('blocklisted')),
    [rejections]
  );

  const importListExclusion = useMovieExclusion(searchPayload.movieId);

  const [isConfirmGrabModalOpen, setIsConfirmGrabModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  const onGrabPressWrapper = useCallback(() => {
    if (downloadAllowed) {
      grabRelease({
        guid,
        indexerId,
      });

      return;
    }

    setIsConfirmGrabModalOpen(true);
  }, [
    guid,
    indexerId,
    downloadAllowed,
    grabRelease,
    setIsConfirmGrabModalOpen,
  ]);

  const onGrabConfirm = useCallback(() => {
    setIsConfirmGrabModalOpen(false);

    grabRelease({
      guid,
      indexerId,
      ...searchPayload,
    });
  }, [guid, indexerId, searchPayload, grabRelease, setIsConfirmGrabModalOpen]);

  const onGrabCancel = useCallback(() => {
    setIsConfirmGrabModalOpen(false);
  }, [setIsConfirmGrabModalOpen]);

  const onOverridePress = useCallback(() => {
    setIsOverrideModalOpen(true);
  }, [setIsOverrideModalOpen]);

  const onOverrideModalClose = useCallback(() => {
    setIsOverrideModalOpen(false);
  }, [setIsOverrideModalOpen]);

  const { height: _height, ...positionStyle } = style;

  return (
    <div ref={rowRef} className={styles.row} style={positionStyle}>
      <VirtualTableRowCell className={styles.protocol}>
        <ProtocolLabel protocol={protocol} />
      </VirtualTableRowCell>

      <VirtualTableRowCell
        className={styles.age}
        title={formatDateTime(publishDate, longDateFormat, timeFormat, {
          includeSeconds: true,
          timeZone,
        })}
      >
        {formatAge(age, ageHours, ageMinutes)}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.title}>
        <div className={styles.titleContent}>
          <Link to={infoUrl} title={title}>
            {title}
          </Link>
        </div>
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.indexer}>
        {indexer}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.history}>
        {history?.grabbed && !history.failed ? (
          <Tooltip
            anchor={<Icon name={icons.DOWNLOADING} kind={kinds.DEFAULT} />}
            tooltip={translate('GrabbedAt', {
              date: formatDateTime(
                history.grabbed,
                longDateFormat,
                timeFormat,
                {
                  includeSeconds: true,
                }
              ),
            })}
            kind={kinds.INVERSE}
            position={tooltipPositions.LEFT}
          />
        ) : null}

        {history?.failed ? (
          <Tooltip
            anchor={<Icon name={icons.DOWNLOADING} kind={kinds.DANGER} />}
            tooltip={translate('FailedAt', {
              date: formatDateTime(history.failed, longDateFormat, timeFormat, {
                includeSeconds: true,
              }),
            })}
            kind={kinds.INVERSE}
            position={tooltipPositions.LEFT}
          />
        ) : null}

        {isBlocklisted ? (
          <Icon
            className={history ? styles.blocklist : ''}
            name={icons.BLOCKLIST}
            kind={kinds.DANGER}
            title={
              history?.failed
                ? translate('BlocklistedAt', {
                    date: formatDateTime(
                      history.failed,
                      longDateFormat,
                      timeFormat,
                      { includeSeconds: true }
                    ),
                  })
                : translate('Blocklisted')
            }
          />
        ) : null}

        {importListExclusion ? (
          <Icon
            className={history || isBlocklisted ? styles.exclusion : ''}
            name={icons.EXCLUDE}
            kind={kinds.WARNING}
            title={translate('ExcludedFromImportListsReason', {
              reason: camelCaseToString(importListExclusion.reason),
            })}
          />
        ) : null}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.size}>
        {formatBytes(size)}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.peers}>
        {protocol === 'torrent' ? (
          <Peers seeders={seeders} leechers={leechers} />
        ) : null}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.languages}>
        <MovieLanguages languages={languages} />
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.quality}>
        <MovieQuality quality={quality} showRevision={true} />
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.customFormatScore}>
        <Tooltip
          anchor={formatCustomFormatScore(
            customFormatScore,
            customFormats.length
          )}
          tooltip={<MovieFormats formats={customFormats} />}
          position={tooltipPositions.LEFT}
        />
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.indexerFlags}>
        {indexerFlags.length ? (
          <Popover
            anchor={<Icon name={icons.FLAG} />}
            title={translate('IndexerFlags')}
            body={
              <ul>
                {indexerFlags.map((flag, index) => {
                  return <li key={index}>{flag}</li>;
                })}
              </ul>
            }
            position={tooltipPositions.LEFT}
          />
        ) : null}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.rejected}>
        {rejections.length ? (
          <Popover
            anchor={<Icon name={icons.DANGER} kind={kinds.DANGER} />}
            title={translate('ReleaseRejected')}
            body={
              <ul>
                {rejections.map((rejection, index) => {
                  return <li key={index}>{rejection}</li>;
                })}
              </ul>
            }
            position={tooltipPositions.LEFT}
          />
        ) : null}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.download}>
        <SpinnerIconButton
          name={getDownloadIcon(isGrabbing, isGrabbed, grabError)}
          kind={getDownloadKind(isGrabbed, grabError)}
          title={getDownloadTooltip(isGrabbing, isGrabbed, grabError)}
          isSpinning={isGrabbing}
          onPress={onGrabPressWrapper}
        />

        <Link
          className={styles.manualDownloadContent}
          title={translate('OverrideAndAddToDownloadQueue')}
          onPress={onOverridePress}
        >
          <div className={styles.manualDownloadContent}>
            <Icon
              className={styles.interactiveIcon}
              name={icons.INTERACTIVE}
              size={12}
            />

            <Icon
              className={styles.downloadIcon}
              name={icons.CIRCLE_DOWN}
              size={10}
            />
          </div>
        </Link>
      </VirtualTableRowCell>

      <ConfirmModal
        isOpen={isConfirmGrabModalOpen}
        kind={kinds.WARNING}
        title={translate('GrabRelease')}
        message={translate('GrabReleaseMessageText', { title })}
        confirmLabel={translate('Grab')}
        onConfirm={onGrabConfirm}
        onCancel={onGrabCancel}
      />

      <OverrideMatchModal
        isOpen={isOverrideModalOpen}
        title={title}
        indexerId={indexerId}
        guid={guid}
        movieId={mappedMovieId}
        languages={languages}
        quality={quality}
        protocol={protocol}
        isGrabbing={isGrabbing}
        grabError={grabError}
        onGrabRelease={grabRelease}
        onModalClose={onOverrideModalClose}
      />
    </div>
  );
}

export default InteractiveSearchRow;
