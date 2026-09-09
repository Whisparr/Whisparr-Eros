import React, { useCallback, useState } from 'react';
import { useSafeForWorkMode } from 'App/safeForWorkStore';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import Link from 'Components/Link/Link';
import Popover from 'Components/Tooltip/Popover';
import { icons } from 'Helpers/Props';
import MovieIndexPosterSelect from 'Movie/Index/Select/MovieIndexPosterSelect';
import MovieHeadshot from 'Movie/MovieHeadshot';
import PerformerDetailsLinks from 'Performer/Details/PerformerDetailsLinks';
import EditPerformerModal from 'Performer/Edit/EditPerformerModal';
import Performer from 'Performer/Performer';
import PerformerGenderIcon from 'Performer/PerformerGenderIcon';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import formatBytes from 'Utilities/Number/formatBytes';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';
import PerformerIndexProgressBar from './PerformerIndexProgressBar';
import styles from './PerformerIndexPoster.css';

interface PerformerIndexPosterProps {
  performer: Performer;
  sortKey: string;
  isSelectMode: boolean;
  posterWidth: number;
  posterHeight: number;
}

function PerformerIndexPoster(props: PerformerIndexPosterProps) {
  const { isSelectMode, posterWidth, posterHeight, performer, sortKey } = props;

  const safeForWorkMode = useSafeForWorkMode();

  const [isEditPerformerModalOpen, setIsEditPerformerModalOpen] =
    useState(false);

  const [hasPosterError, setHasPosterError] = useState(false);

  const onPosterLoadError = useCallback(() => {
    setHasPosterError(true);
  }, [setHasPosterError]);

  const onPosterLoad = useCallback(() => {
    setHasPosterError(false);
  }, [setHasPosterError]);

  const onEditPerformerPress = useCallback(() => {
    setIsEditPerformerModalOpen(true);
  }, [setIsEditPerformerModalOpen]);

  const onEditPerformerModalClose = useCallback(() => {
    setIsEditPerformerModalOpen(false);
  }, [setIsEditPerformerModalOpen]);

  const link = `/performer/${performer.foreignId}`;

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
  };

  return (
    <div className={styles.content}>
      <div className={styles.posterContainer} title={performer.fullName}>
        {isSelectMode ? (
          <MovieIndexPosterSelect movieId={performer.id} />
        ) : null}

        <Label className={styles.controls}>
          <IconButton
            name={icons.EDIT}
            title={translate('EditPerformer')}
            tabIndex={-1}
            onPress={onEditPerformerPress}
          />

          <span className={styles.externalLinks}>
            <Popover
              anchor={<Icon name={icons.EXTERNAL_LINK} size={12} />}
              title={translate('Links')}
              body={<PerformerDetailsLinks foreignId={performer.foreignId} />}
            />
          </span>
        </Label>

        <Link className={styles.link} style={elementStyle} to={link}>
          <div className={styles.posterImageWrapper} style={elementStyle}>
            <MovieHeadshot
              safeForWorkMode={safeForWorkMode}
              style={elementStyle}
              className={styles.poster}
              images={performer.images}
              size={250}
              lazy={true}
              overflow={true}
              title={performer.fullName}
              onError={onPosterLoadError}
              onLoad={onPosterLoad}
            />
            <div className={styles.progressBarOverlay}>
              <PerformerIndexProgressBar
                performer={performer}
                width={posterWidth}
                detailedProgressBar={true}
                bottomRadius={false}
              />
            </div>
            {hasPosterError ? (
              <div className={styles.overlayTitle}>{performer.fullName}</div>
            ) : null}
          </div>
        </Link>
      </div>

      {performer.fullName ? (
        <div className={styles.title} title={performer.fullName}>
          {performer.fullName}
        </div>
      ) : null}

      {/* Optional info based on what the sortKey is set to */}
      {sortKey === 'age' && performer.age ? (
        <div className={styles.age}>
          <span title={`${performer.age} ${translate('YearsOld')}`}>
            <Icon className={styles.ageIcon} name={icons.CAKE} size={12} />
            <span>
              {performer.age ? `${performer.age}` : translate('Unknown')}
            </span>
          </span>
        </div>
      ) : null}

      {sortKey === 'ethnicity' ? (
        <div className={styles.ethnicity}>
          {performer.ethnicity
            ? titleCase(performer.ethnicity)
            : translate('Unknown')}
        </div>
      ) : null}

      {sortKey === 'gender' ? (
        <div className={styles.gender}>
          <span>
            {performer.gender
              ? titleCase(performer.gender)
              : translate('Unknown')}
            <PerformerGenderIcon gender={performer.gender} />
          </span>
        </div>
      ) : null}

      {sortKey === 'hairColor' ? (
        <div className={styles.hairColor}>
          {performer.hairColor
            ? titleCase(performer.hairColor)
            : translate('Unknown')}
        </div>
      ) : null}

      {sortKey === 'qualityProfileId' ? (
        <div className={styles.qualityProfile}>
          {performer.qualityProfileId ? (
            <QualityProfileName qualityProfileId={performer.qualityProfileId} />
          ) : (
            translate('Unknown')
          )}
        </div>
      ) : null}

      {sortKey === 'sizeOnDisk' ? (
        <div className={styles.sizeOnDisk} title={translate('SizeOnDisk')}>
          <span>
            <Icon
              className={styles.sizeOnDiskIcon}
              name={icons.DRIVE}
              size={12}
            />
            <span>{formatBytes(performer.sizeOnDisk)}</span>
          </span>
        </div>
      ) : null}

      {sortKey === 'totalMovieCount' ? (
        <div
          className={styles.totalMovieCount}
          title={translate('TotalMovieCount')}
        >
          <span>{`${performer.totalMovieCount} ${translate('Movies')}`}</span>
        </div>
      ) : null}

      {sortKey === 'totalSceneCount' ? (
        <div
          className={styles.totalSceneCount}
          title={translate('TotalSceneCount')}
        >
          <span>{`${performer.totalSceneCount} ${translate('Scenes')}`}</span>
        </div>
      ) : null}

      <EditPerformerModal
        isOpen={isEditPerformerModalOpen}
        performer={performer}
        onModalClose={onEditPerformerModalClose}
      />
    </div>
  );
}

export default PerformerIndexPoster;
