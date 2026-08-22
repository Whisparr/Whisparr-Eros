import React, { useCallback, useState } from 'react';
import TextTruncate from 'react-text-truncate';
import type { Swiper as SwiperClass } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { CollectionOverviewOptions } from 'Collection/collectionOptionsStore';
import EditMovieCollectionModal from 'Collection/Edit/EditMovieCollectionModal';
import { CollectionItem } from 'Collection/useCollectionItems';
import { useToggleCollectionMonitored } from 'Collection/useMovieCollections';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import Label from 'Components/Label';
import IconButton from 'Components/Link/IconButton';
import MonitorToggleButton, {
  getToggledMonitored,
  MonitorTogglePressValue,
} from 'Components/MonitorToggleButton';
import { icons, sizes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import MovieGenres from 'Movie/MovieGenres';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import dimensions from 'Styles/Variables/dimensions';
import fonts from 'Styles/Variables/fonts';
import { CheckInputChanged } from 'typings/inputs';
import translate from 'Utilities/String/translate';
import CollectionMovie from './CollectionMovie';
import CollectionMovieLabel from './CollectionMovieLabel';
import styles from './CollectionOverview.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const columnPadding = Number.parseInt(dimensions.movieIndexColumnPadding, 10);
const columnPaddingSmallScreen = Number.parseInt(
  dimensions.movieIndexColumnPaddingSmallScreen,
  10
);
const defaultFontSize = Number.parseInt(fonts.defaultFontSize, 10);
const lineHeight = Number.parseFloat(fonts.lineHeight);

// Hardcoded height beased on line-height of 32 + bottom margin of 10. 19 + 5 for List Row
// Less side-effecty than using react-measure.
const titleRowHeight = 100;

function getContentHeight(rowHeight: number, isSmallScreen: boolean) {
  const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;

  return rowHeight - padding;
}

interface CollectionOverviewProps {
  collection: CollectionItem;
  existingMovies: Map<string, Movie>;
  posterWidth: number;
  posterHeight: number;
  rowHeight: number;
  overviewOptions: CollectionOverviewOptions;
  isSmallScreen: boolean;
  isSelected?: boolean;
  onSelectedChange(change: {
    id: number;
    value: boolean;
    shiftKey?: boolean;
  }): void;
}

function CollectionOverview({
  collection,
  existingMovies,
  posterWidth,
  posterHeight,
  rowHeight,
  overviewOptions,
  isSmallScreen,
  isSelected,
  onSelectedChange,
}: CollectionOverviewProps) {
  const {
    id,
    title,
    overview,
    monitored,
    qualityProfileId,
    rootFolderPath,
    genres,
    movies,
    missingMovies,
  } = collection;

  const { showDetails, showOverview, showPosters, detailedProgressBar } =
    overviewOptions;

  const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] =
    useState(false);
  const [swiperPrevRef, setSwiperPrevRef] = useState<HTMLSpanElement | null>(
    null
  );
  const [swiperNextRef, setSwiperNextRef] = useState<HTMLSpanElement | null>(
    null
  );

  const toggleMonitored = useToggleCollectionMonitored();

  const handleMonitorTogglePress = useCallback(
    (value: MonitorTogglePressValue) => {
      // The whole collection is sent back: `UpdateCollection` maps the resource
      // onto the stored model, so a body carrying only `monitored` would blank
      // everything else.
      toggleMonitored.mutate({
        ...collection,
        monitored: getToggledMonitored(value),
      });
    },
    [collection, toggleMonitored]
  );

  const handleEditCollectionPress = useCallback(() => {
    setIsEditCollectionModalOpen(true);
  }, []);

  const handleEditCollectionModalClose = useCallback(() => {
    setIsEditCollectionModalOpen(false);
  }, []);

  const handleSwiperInit = useCallback(
    (swiper: SwiperClass) => {
      // @ts-expect-error navigation params are loosely typed
      swiper.params.navigation.prevEl = swiperPrevRef;
      // @ts-expect-error navigation params are loosely typed
      swiper.params.navigation.nextEl = swiperNextRef;
      swiper.navigation.init();
      swiper.navigation.update();
    },
    [swiperPrevRef, swiperNextRef]
  );

  const handleChange = useCallback(
    ({ value, shiftKey }: CheckInputChanged) => {
      onSelectedChange({ id, value, shiftKey });
    },
    [id, onSelectedChange]
  );

  const contentHeight = getContentHeight(rowHeight, isSmallScreen);
  const overviewHeight = contentHeight - titleRowHeight - posterHeight;

  return (
    // `styles.container` and `styles.checkInput` below are not in
    // `CollectionOverview.css`, so both resolved to `undefined`.
    <div>
      <div className={styles.content}>
        <div className={styles.editorSelect}>
          <CheckInput
            name={id.toString()}
            value={isSelected}
            onChange={handleChange}
          />
        </div>

        <div className={styles.info} style={{ maxHeight: contentHeight }}>
          <div className={styles.titleRow}>
            <div className={styles.titleContainer}>
              <div className={styles.toggleMonitoredContainer}>
                <MonitorToggleButton
                  className={styles.monitorToggleButton}
                  monitored={monitored}
                  isSaving={toggleMonitored.isPending}
                  size={isSmallScreen ? 20 : 25}
                  onPress={handleMonitorTogglePress}
                />
              </div>

              <div className={styles.title}>{title}</div>

              <IconButton
                name={icons.EDIT}
                title={translate('EditCollection')}
                onPress={handleEditCollectionPress}
              />
            </div>

            {showPosters ? (
              <div className={styles.navigationButtons}>
                <span ref={setSwiperPrevRef}>
                  <IconButton
                    name={icons.ARROW_LEFT}
                    title={translate('ScrollMovies')}
                    size={20}
                  />
                </span>

                <span ref={setSwiperNextRef}>
                  <IconButton
                    name={icons.ARROW_RIGHT}
                    title={translate('ScrollMovies')}
                    size={20}
                  />
                </span>
              </div>
            ) : null}
          </div>

          {showDetails ? (
            <div className={styles.defaults}>
              <Label className={styles.detailsLabel} size={sizes.MEDIUM}>
                <Icon name={icons.DRIVE} size={13} />
                <span className={styles.status}>
                  {translate('CountMissingMoviesFromLibrary', {
                    count: missingMovies,
                  })}
                </span>
              </Label>

              {isSmallScreen ? null : (
                <Label className={styles.detailsLabel} size={sizes.MEDIUM}>
                  <Icon name={icons.PROFILE} size={13} />
                  <span className={styles.qualityProfileName}>
                    <QualityProfileName qualityProfileId={qualityProfileId} />
                  </span>
                </Label>
              )}

              {isSmallScreen ? null : (
                <Label className={styles.detailsLabel} size={sizes.MEDIUM}>
                  <Icon name={icons.FOLDER} size={13} />
                  <span className={styles.path}>{rootFolderPath}</span>
                </Label>
              )}

              {isSmallScreen ? null : (
                <Label className={styles.detailsLabel} size={sizes.MEDIUM}>
                  <Icon name={icons.GENRE} size={13} />
                  <MovieGenres className={styles.genres} genres={genres} />
                </Label>
              )}
            </div>
          ) : null}

          {showOverview ? (
            <div className={styles.details}>
              <div className={styles.overview}>
                <TextTruncate
                  line={Math.floor(
                    overviewHeight / (defaultFontSize * lineHeight)
                  )}
                  text={overview}
                />
              </div>
            </div>
          ) : null}

          {showPosters ? (
            <div className={styles.sliderContainer}>
              <Swiper
                slidesPerView="auto"
                spaceBetween={10}
                slidesPerGroup={3}
                loop={false}
                className="mySwiper"
                modules={[Navigation]}
                onInit={handleSwiperInit}
              >
                {movies.map((movie) => (
                  <SwiperSlide
                    key={movie.tmdbId}
                    style={{ width: posterWidth }}
                  >
                    <CollectionMovie
                      movie={movie}
                      existingMovie={existingMovies.get(movie.foreignId)}
                      collection={collection}
                      posterWidth={posterWidth}
                      posterHeight={posterHeight}
                      detailedProgressBar={detailedProgressBar}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className={styles.labelsContainer}>
              {movies.map((movie) => (
                <CollectionMovieLabel
                  key={movie.tmdbId}
                  movie={movie}
                  existingMovie={existingMovies.get(movie.foreignId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditMovieCollectionModal
        isOpen={isEditCollectionModalOpen}
        collectionId={id}
        onModalClose={handleEditCollectionModalClose}
      />
    </div>
  );
}

export default CollectionOverview;
