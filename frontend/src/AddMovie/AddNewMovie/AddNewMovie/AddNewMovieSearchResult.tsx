import React, { useCallback, useState } from 'react';
import Icon, { IconName } from 'Components/Icon';
import Label, { LabelProps } from 'Components/Label';
import Link from 'Components/Link/Link';
import TmdbRating from 'Components/TmdbRating';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, sizes, tooltipPositions } from 'Helpers/Props';
import MovieDetailsLinks from 'Movie/Details/MovieDetailsLinks';
import MovieStatusLabel from 'Movie/Details/MovieStatusLabel';
import MovieIndexProgressBar from 'Movie/Index/ProgressBar/MovieIndexProgressBar';
import { MovieStatus } from 'Movie/Movie';
import MovieGenres from 'Movie/MovieGenres';
import MoviePoster from 'Movie/MoviePoster';
import ScenePoster from 'Scene/ScenePoster';
import StudioLogo from 'Studio/StudioLogo';
import formatRuntime from 'Utilities/Date/formatRuntime';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import firstCharToUpper from 'Utilities/String/firstCharToUpper';
import translate from 'Utilities/String/translate';
import {
  MovieLookupResult,
  useAddNewMovieSearchResult,
} from '../useAddNewMovie';
import AddNewMovieModal from './AddNewMovieModal';
import styles from './AddNewMovieSearchResult.css';

// TODO: Use actual credit type instead
interface Credit {
  id?: number | string;
  name?: string;
  performer?: {
    name?: string;
    gender?: string;
  };
  gender?: string;
}

// TODO: use the GenderIcon component
function genderToIcon(gender?: string): IconName {
  switch (gender) {
    case 'male':
      return (icons.PERFORMERMALE || icons.PERFORMER) as IconName;
    case 'female':
      return (icons.PERFORMERFEMALE || icons.PERFORMER) as IconName;
    case 'transMale':
    case 'transFemale':
    case 'interSex':
    case 'nonBinary':
      return (icons.PERFORMERTRANS || icons.PERFORMER) as IconName;
    default:
      return icons.PERFORMER as IconName;
  }
}

interface AddNewMovieSearchResultProps extends MovieLookupResult {
  colorImpairedMode?: boolean;
}

// TODO: movie props to proper typing, this seems to be a deconstruct of Movie.ts
function AddNewMovieSearchResult(props: AddNewMovieSearchResultProps) {
  const { colorImpairedMode, ...item } = props;
  const {
    id,
    foreignId,
    tmdbId,
    tpdbId,
    title,
    titleSlug,
    year,
    studioTitle,
    genres,
    searchCredits,
    status,
    itemType,
    releaseDate,
    overview,
    website,
    ratings,
    images,
    isExisting,
    isExcluded,
    monitored,
    isAvailable,
    movieFile,
    sizeOnDisk,
    runtime,
    certification,
  } = item;

  const { isSmallScreen, safeForWorkMode, shortDateFormat, showRelativeDates } =
    useAddNewMovieSearchResult();

  // TODO: For now movieRuntimeFormat isn't part of UiSettings selector; fall back to 'hoursMinutes'
  const movieRuntimeFormat = 'hoursMinutes';

  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);

  const onPress = useCallback(() => {
    setIsAddMovieModalOpen(true);
  }, []);

  const onAddMovieModalClose = useCallback(() => {
    setIsAddMovieModalOpen(false);
  }, []);

  const hasMovieFile = !!movieFile || (sizeOnDisk ?? 0) > 0;

  const linkProps = isExisting ? { to: `/movie/${titleSlug}` } : { onPress };

  const providerProps =
    itemType === 'movie'
      ? { tmdbId, tpdbId, website }
      : { stashId: foreignId, website };

  let ImageItem: React.ComponentType<Record<string, unknown>> =
    MoviePoster as unknown as React.ComponentType<Record<string, unknown>>;
  let posterWidth = 167;
  let posterHeight = 250;

  if (itemType === 'scene') {
    ImageItem = ScenePoster as unknown as React.ComponentType<
      Record<string, unknown>
    >;
    posterWidth = 300;
    posterHeight = 169;
  }

  if (itemType === 'studio') {
    ImageItem = StudioLogo as unknown as React.ComponentType<
      Record<string, unknown>
    >;
    posterWidth = 250;
    posterHeight = 250;
  }

  const elementStyle = {
    width: `${posterWidth}px`,
    height: `${posterHeight}px`,
    objectFit: 'contain' as const,
  };

  return (
    <div className={styles.searchResult}>
      <Link className={styles.underlay} {...linkProps} />

      <div className={styles.overlay}>
        {!isSmallScreen && (
          <div>
            <div className={styles.posterContainer}>
              <ImageItem
                safeForWorkMode={safeForWorkMode}
                className={itemType === 'scene' ? styles.scene : styles.poster}
                style={elementStyle}
                images={images}
                size={250}
                overflow={true}
                lazy={false}
              />
            </div>

            {isExisting && (
              <MovieIndexProgressBar
                movieId={id}
                movieFile={movieFile}
                monitored={monitored}
                hasFile={hasMovieFile}
                status={status as MovieStatus}
                width={posterWidth}
                detailedProgressBar={true}
                isAvailable={isAvailable}
              />
            )}
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <div className={styles.titleContainer}>
              <div className={styles.title}>
                {title}

                {!!year && !String(title || '').includes(String(year)) ? (
                  <span className={styles.year}>
                    (
                    {releaseDate
                      ? getRelativeDate({
                          date: releaseDate,
                          shortDateFormat,
                          showRelativeDates,
                        })
                      : year}
                    )
                  </span>
                ) : null}
              </div>
            </div>

            <div className={styles.icons}>
              <div>
                {isExisting && (
                  <Icon
                    className={styles.alreadyExistsIcon}
                    name={icons.CHECK_CIRCLE}
                    size={36}
                    title={translate('AlreadyInYourLibrary')}
                  />
                )}

                {isExcluded && (
                  <Icon
                    className={styles.exclusionIcon}
                    name={icons.DANGER}
                    size={36}
                    title={translate('MovieIsOnImportExclusionList')}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            {!!certification && (
              <span className={styles.certification}>{certification}</span>
            )}

            {!!runtime && (
              <span className={styles.runtime}>
                {formatRuntime(runtime, movieRuntimeFormat)}
              </span>
            )}
          </div>

          <div>
            <Label size={sizes.LARGE} kind={kinds.PINK as LabelProps['kind']}>
              {firstCharToUpper(itemType)}
            </Label>

            {itemType === 'movie' && (
              <Label size={sizes.LARGE}>
                <TmdbRating ratings={ratings} iconSize={13} />
              </Label>
            )}

            {!!studioTitle && (
              <Label size={sizes.LARGE}>
                <Icon name={icons.STUDIO} size={13} />
                <span className={styles.studio}>{studioTitle}</span>
              </Label>
            )}

            {searchCredits && searchCredits.length > 0
              ? (searchCredits as Credit[]).slice(0, 4).map((credit, index) => {
                  const performer =
                    (credit && (credit.performer || credit)) || {};
                  const name = (performer as Credit).name || credit.name || '';
                  const gender = (performer as Credit).gender;
                  const iconName = genderToIcon(gender);

                  return (
                    <Label key={credit.id || name || index} size={sizes.LARGE}>
                      <Icon name={iconName} size={13} />
                      <span className={styles.credits}>{name}</span>
                    </Label>
                  );
                })
              : null}

            {(genres?.length ?? 0) > 0 ? (
              <Label size={sizes.LARGE}>
                <Icon name={icons.GENRE} size={13} />
                <MovieGenres className={styles.genres} genres={genres} />
              </Label>
            ) : null}

            <Tooltip
              anchor={
                <Label size={sizes.LARGE}>
                  <Icon name={icons.EXTERNAL_LINK} size={13} />
                  <span className={styles.links}>{translate('Links')}</span>
                </Label>
              }
              tooltip={<MovieDetailsLinks {...providerProps} />}
              canFlip={true}
              kind={kinds.INVERSE}
              position={tooltipPositions.TOP}
            />

            {isExisting && isSmallScreen && (
              <MovieStatusLabel
                status={status}
                hasMovieFiles={hasMovieFile}
                monitored={monitored}
                isAvailable={isAvailable}
                useLabel={true}
                colorImpairedMode={colorImpairedMode}
              />
            )}
          </div>

          <div className={styles.overview}>{overview}</div>
        </div>
      </div>

      <AddNewMovieModal
        isOpen={isAddMovieModalOpen && !isExisting}
        item={item}
        onModalClose={onAddMovieModalClose}
      />
    </div>
  );
}

AddNewMovieSearchResult.defaultProps = {
  genres: [],
  searchCredits: [],
  isExcluded: false,
};

export default AddNewMovieSearchResult;
