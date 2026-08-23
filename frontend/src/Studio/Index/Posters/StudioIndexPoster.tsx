import React, { useCallback, useState } from 'react';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import Popover from 'Components/Tooltip/Popover';
import { icons } from 'Helpers/Props';
import MovieIndexPosterSelect from 'Movie/Index/Select/MovieIndexPosterSelect';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import StudioDetailsLinks from 'Studio/Details/StudioDetailsLinks';
import EditStudioModal from 'Studio/Edit/EditStudioModal';
import { useStudioIndexOption } from 'Studio/Index/studioIndexOptionsStore';
import Studio from 'Studio/Studio';
import StudioLogo from 'Studio/StudioLogo';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import StudioIndexProgressBar from './StudioIndexProgressBar';
import styles from './StudioIndexPoster.css';

interface StudioIndexPosterProps {
  studio: Studio;
  sortKey: string;
  isSelectMode: boolean;
  posterWidth: number;
  posterHeight: number;
}

function StudioIndexPoster(props: Readonly<StudioIndexPosterProps>) {
  const safeForWorkMode = useSafeForWorkMode();

  const { studio, isSelectMode, posterWidth, posterHeight } = props;
  const { id: studioId } = studio;

  const { showTitle, detailedProgressBar } =
    useStudioIndexOption('posterOptions');
  const [isEditStudioModalOpen, setIsEditStudioModalOpen] = useState(false);

  const { title, images, foreignId, website, tmdbId, tpdbId } = studio;

  const [hasPosterError, setHasPosterError] = useState(false);

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, [setHasPosterError]);

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, [setHasPosterError]);

  const onEditStudioPress = useCallback(() => {
    setIsEditStudioModalOpen(true);
  }, [setIsEditStudioModalOpen]);

  const onEditStudioModalClose = useCallback(() => {
    setIsEditStudioModalOpen(false);
  }, [setIsEditStudioModalOpen]);

  const link = `/studio/${foreignId}`;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  return (
    <div className={styles.content}>
      <div
        className={styles.posterContainer}
        style={elementStyle}
        title={title}
      >
        {isSelectMode ? <MovieIndexPosterSelect movieId={studioId} /> : null}

        <Label className={styles.controls}>
          <IconButton
            name={icons.EDIT}
            title={translate('EditStudio')}
            onPress={onEditStudioPress}
          />

          <span className={styles.externalLinks}>
            <Popover
              anchor={<Icon name={icons.EXTERNAL_LINK} size={12} />}
              title={translate('Links')}
              body={
                <StudioDetailsLinks
                  website={website}
                  foreignId={foreignId}
                  tmdbId={tmdbId}
                  tpdbId={tpdbId}
                />
              }
            />
          </span>
        </Label>

        <Link className={styles.link} style={elementStyle} to={link}>
          <StudioLogo
            className={styles.studioLogo}
            safeForWorkMode={safeForWorkMode}
            images={images}
            size={250}
            lazy={true}
            onPosterLoad={onPosterLoad}
            onPosterLoadError={onPosterLoadError}
          />

          {detailedProgressBar ? (
            <div className={styles.progressBarOverlay}>
              <StudioIndexProgressBar
                Studio={studio}
                width={posterWidth}
                detailedProgressBar={true}
                bottomRadius={false}
              />
            </div>
          ) : null}

          {hasPosterError ? (
            <div className={styles.overlayTitle}>{title}</div>
          ) : null}
        </Link>
      </div>

      {showTitle ? (
        <div className={styles.title} title={title}>
          {title}
        </div>
      ) : null}

      {props.sortKey === 'qualityProfileId' ? (
        <div className={styles.qualityProfile}>
          {studio.qualityProfileId ? (
            <QualityProfileName qualityProfileId={studio.qualityProfileId} />
          ) : (
            translate('Unknown')
          )}
        </div>
      ) : null}

      {props.sortKey === 'sizeOnDisk' ? (
        <div className={styles.sizeOnDisk} title={translate('SizeOnDisk')}>
          <span>
            <Icon
              className={styles.sizeOnDiskIcon}
              name={icons.DRIVE}
              size={12}
            />
            <span>{formatBytes(studio.sizeOnDisk)}</span>
          </span>
        </div>
      ) : null}

      {props.sortKey === 'totalMovieCount' ? (
        <div
          className={styles.totalMovieCount}
          title={translate('TotalMovieCount')}
        >
          <span>{`${studio.totalMovieCount} ${translate('Movies')}`}</span>
        </div>
      ) : null}

      {props.sortKey === 'totalSceneCount' ? (
        <div
          className={styles.totalSceneCount}
          title={translate('TotalSceneCount')}
        >
          <span>{`${studio.totalSceneCount} ${translate('Scenes')}`}</span>
        </div>
      ) : null}

      <EditStudioModal
        isOpen={isEditStudioModalOpen}
        studio={studio}
        onModalClose={onEditStudioModalClose}
      />
    </div>
  );
}

export default StudioIndexPoster;
