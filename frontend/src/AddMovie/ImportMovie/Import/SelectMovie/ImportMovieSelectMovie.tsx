import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Manager, Popper, Reference } from 'react-popper';
import FormInputButton from 'Components/Form/FormInputButton';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Portal from 'Components/Portal';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import {
  ImportItem,
  ImportItemType,
  MovieLookupResult,
} from '../../ImportMovieTypes';
import ImportMovieSearchResult from './ImportMovieSearchResult';
import ImportMovieTitle from './ImportMovieTitle';
import styles from './ImportMovieSelectMovie.css';

interface ImportMovieSelectMovieProps {
  readonly item: ImportItem;
  readonly isLookingUp: boolean;
  readonly onLookup: (opts: {
    id: string;
    term: string;
    itemType?: ImportItemType;
    topOfQueue: boolean;
  }) => void;
  readonly onMovieSelect: (id: string, movie: MovieLookupResult) => void;
}

function ImportMovieSelectMovie({
  item,
  isLookingUp,
  onLookup,
  onMovieSelect,
}: ImportMovieSelectMovieProps) {
  const {
    id,
    itemType,
    selectedMovie,
    isFetching,
    isPopulated,
    isQueued,
    error,
    items,
  } = item;

  const uid = useId();
  const buttonId = `${uid}-button`;
  const contentId = `${uid}-content`;

  const [term, setTerm] = useState(id);
  const [isOpen, setIsOpen] = useState(false);

  const scheduleUpdateRef = useRef<(() => void) | null>(null);
  const lookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep popper position updated when content changes
  useEffect(() => {
    scheduleUpdateRef.current?.();
  });

  const handleWindowClick = useCallback(
    (event: MouseEvent) => {
      const button = globalThis.document.getElementById(buttonId);
      const content = globalThis.document.getElementById(contentId);
      if (!button || !content) {
        return;
      }
      if (
        !button.contains(event.target as Node) &&
        !content.contains(event.target as Node)
      ) {
        setIsOpen(false);
        globalThis.removeEventListener('click', handleWindowClick);
      }
    },
    [buttonId, contentId]
  );

  const onPress = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        globalThis.removeEventListener('click', handleWindowClick);
      } else {
        globalThis.addEventListener('click', handleWindowClick);
      }
      return !prev;
    });
  }, [handleWindowClick]);

  const onSearchInputChange = useCallback(
    ({ value }: { value: string }) => {
      if (lookupTimeoutRef.current) {
        clearTimeout(lookupTimeoutRef.current);
      }
      setTerm(value);
      lookupTimeoutRef.current = setTimeout(() => {
        onLookup({ id, term: value, itemType, topOfQueue: true });
      }, 200);
    },
    [id, itemType, onLookup]
  );

  const onRefreshPress = useCallback(() => {
    onLookup({ id, term, itemType, topOfQueue: true });
  }, [id, itemType, onLookup, term]);

  const onMoviePress = useCallback(
    (foreignId: string) => {
      const movie = items.find((i) => i.foreignId === foreignId);
      if (movie) {
        setIsOpen(false);
        globalThis.removeEventListener('click', handleWindowClick);
        onMovieSelect(id, movie);
      }
    },
    [handleWindowClick, id, items, onMovieSelect]
  );

  const errorMessage = error instanceof Error ? error.message : undefined;

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <div ref={ref} id={buttonId}>
            <Link className={styles.button} component="div" onPress={onPress}>
              {isLookingUp && isQueued && !isPopulated ? (
                <LoadingIndicator className={styles.loading} size={20} />
              ) : null}

              {isPopulated && selectedMovie ? (
                <ImportMovieTitle
                  itemType={selectedMovie.itemType}
                  title={selectedMovie.title}
                  year={selectedMovie.year}
                  releaseDate={selectedMovie.releaseDate}
                  studioTitle={selectedMovie.studioTitle}
                  performerNames={selectedMovie.performerNames}
                  searchCredits={selectedMovie.searchCredits}
                  isExistingMovie={selectedMovie.isExisting}
                />
              ) : null}

              {isPopulated && !selectedMovie ? (
                <div className={styles.noMatches}>
                  <Icon
                    className={styles.warningIcon}
                    name={icons.WARNING}
                    kind={kinds.WARNING}
                  />
                  {translate('NoMatchFound')}
                </div>
              ) : null}

              {!isFetching && !!error ? (
                <div>
                  <Icon
                    className={styles.warningIcon}
                    title={errorMessage}
                    name={icons.WARNING}
                    kind={kinds.WARNING}
                  />
                  {translate('SearchFailedPleaseTryAgainLater')}
                </div>
              ) : null}

              <div className={styles.dropdownArrowContainer}>
                <Icon name={icons.CARET_DOWN} />
              </div>
            </Link>
          </div>
        )}
      </Reference>

      <Portal>
        <Popper placement="bottom" modifiers={[{ name: 'preventOverflow' }]}>
          {({ ref, style, update }) => {
            scheduleUpdateRef.current = () => {
              update();
            };

            return (
              <div
                ref={ref}
                id={contentId}
                className={styles.contentContainer}
                style={style}
              >
                {isOpen ? (
                  <div className={styles.content}>
                    <div className={styles.searchContainer}>
                      <div className={styles.searchIconContainer}>
                        <Icon name={icons.SEARCH} />
                      </div>

                      <TextInput
                        className={styles.searchInput}
                        name={`${id}_textInput`}
                        value={term}
                        onChange={onSearchInputChange}
                      />

                      <FormInputButton
                        kind={kinds.DEFAULT}
                        canSpin={true}
                        isSpinning={isFetching}
                        onPress={onRefreshPress}
                      >
                        <Icon name={icons.REFRESH} />
                      </FormInputButton>
                    </div>

                    <div className={styles.results}>
                      {items.map((lookupItem) => (
                        <ImportMovieSearchResult
                          key={lookupItem.foreignId}
                          item={lookupItem}
                          onPress={onMoviePress}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          }}
        </Popper>
      </Portal>
    </Manager>
  );
}

export default ImportMovieSelectMovie;
