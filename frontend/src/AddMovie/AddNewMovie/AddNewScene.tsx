import React, { useCallback, useRef } from 'react';
import Alert from 'Components/Alert';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddNewMovieSearchResult from './AddNewMovie/AddNewMovieSearchResult';
import { useAddNewMovie } from './useAddNewMovie';
import styles from './AddNewMovie.css';

function AddNewScene() {
  const {
    term,
    items,
    isFetching,
    error,
    hasExistingMovies,
    colorImpairedMode,
    onLookupChange,
    onClearLookup,
  } = useAddNewMovie('scene');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const onSearchInputChange = useCallback(
    ({ value }: { value: string }) => {
      onLookupChange(value);
    },
    [onLookupChange]
  );

  const onClearMovieLookupPress = useCallback(() => {
    onClearLookup();
    searchInputRef.current?.focus();
  }, [onClearLookup]);

  return (
    <PageContent title={translate('AddNewScene')}>
      <PageContentBody>
        <div className={styles.searchContainer}>
          <div className={styles.searchIconContainer}>
            <Icon name={icons.SEARCH} size={20} />
          </div>

          <TextInput
            ref={searchInputRef}
            className={styles.searchInput}
            name="movieLookup"
            value={term}
            placeholder="e.g. The Dark Knight, stash:e7e4f9c0-3d9f-4136-b38b-9b49398c0ade"
            autoFocus={true}
            onChange={onSearchInputChange}
          />

          <Button
            className={styles.clearLookupButton}
            onPress={onClearMovieLookupPress}
          >
            <Icon name={icons.REMOVE} size={20} />
          </Button>
        </div>

        {isFetching && !items.length && <LoadingIndicator />}

        {!isFetching && !!error ? (
          <div className={styles.message}>
            <div className={styles.helpText}>
              {translate('FailedLoadingSearchResults')}
            </div>
            <Alert kind={kinds.WARNING}>
              {error?.statusBody?.message ?? error?.message ?? ''}
            </Alert>
            <div>
              {/*  TODO: This link is pretty specific to TMDb-related search
              failures. We should consider a more general troubleshooting guide
              for search failures that can cover other potential failure
              scenarios (e.g., failures related to other scene metadata
              providers, or failures related to parsing stash IDs). */}
              <Link to="https://wiki.servarr.com/whisparr/troubleshooting#invalid-response-received-from-tmdb">
                {translate('WhySearchesCouldBeFailing')}
              </Link>
            </div>
          </div>
        ) : null}

        {!error && !!items.length && (
          <div className={styles.searchResults}>
            {items
              .filter(
                (item) =>
                  item.itemType !== 'performer' && item.itemType !== 'studio'
              )
              .map((item) => (
                <AddNewMovieSearchResult
                  key={item.foreignId}
                  {...item}
                  colorImpairedMode={colorImpairedMode}
                />
              ))}
          </div>
        )}

        {!isFetching && !error && !items.length && !!term && (
          <div className={styles.message}>
            <div className={styles.noResults}>
              {translate('CouldNotFindResults', { term })}
            </div>
            <div>{translate('YouCanAlsoSearch')}</div>
            <div>
              {/* TODO: This link needs a refresh.  Unsuer if we keep Servarr for wiki or not */}
              <Link to="https://wiki.servarr.com/whisparr/faq#why-can-i-not-add-a-new-movie-to-whisparr">
                {translate('CantFindScene')}
              </Link>
            </div>
          </div>
        )}

        {term ? null : (
          <div className={styles.message}>
            <div className={styles.helpText}>
              {translate('AddNewSceneMessage')}
            </div>
            <div>{translate('AddNewStashIdMessage')}</div>
          </div>
        )}

        {!term && !hasExistingMovies ? (
          <div className={styles.message}>
            <div className={styles.noMoviesText}>
              {translate('HaveNotAddedMovies')}
            </div>
            <div>
              <Button to="/add/import/scenes" kind={kinds.PRIMARY}>
                {translate('ImportExistingMovies')}
              </Button>
            </div>
          </div>
        ) : null}

        <div />
      </PageContentBody>
    </PageContent>
  );
}

export default AddNewScene;
