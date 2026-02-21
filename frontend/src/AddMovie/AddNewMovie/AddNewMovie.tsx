import React, { useCallback } from 'react';
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

function AddNewMovie() {
  const {
    term,
    items,
    isFetching,
    error,
    hasExistingMovies,
    colorImpairedMode,
    onLookupChange,
    onClearLookup,
  } = useAddNewMovie('movie');

  const onSearchInputChange = useCallback(
    ({ value }: { value: string }) => {
      onLookupChange(value);
    },
    [onLookupChange]
  );

  const onClearMovieLookupPress = useCallback(() => {
    onClearLookup();
  }, [onClearLookup]);

  return (
    <PageContent title={translate('AddNewMovie')}>
      <PageContentBody>
        <div className={styles.searchContainer}>
          <div className={styles.searchIconContainer}>
            <Icon name={icons.SEARCH} size={20} />
          </div>

          <TextInput
            className={styles.searchInput}
            name="movieLookup"
            value={term}
            placeholder="e.g. https://theporndb.net/movies/bellesafilms-consumed-by-desire, tpdbid:5267419, tpdb:d534a2e3-b77a-4aac-95f6-e5671faf7165"
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

            <Alert kind={kinds.DANGER}>
              {error?.statusBody?.message ?? error?.message ?? ''}
            </Alert>

            <div>
              <Link to="https://wiki.servarr.com/whisparr/troubleshooting#invalid-response-received-from-tmdb">
                {translate('WhySearchesCouldBeFailing')}
              </Link>
            </div>
          </div>
        ) : null}

        {!error && !!items.length && (
          <div className={styles.searchResults}>
            {items.map((item) => (
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
              <Link to="https://wiki.servarr.com/whisparr/faq#why-can-i-not-add-a-new-movie-to-whisparr">
                {translate('CantFindMovie')}
              </Link>
            </div>
          </div>
        )}

        {term ? null : (
          <div className={styles.message}>
            <div className={styles.helpText}>
              {translate('AddNewMovieMessage')}
            </div>
            <div>{translate('AddNewTmdbIdMessage')}</div>
          </div>
        )}

        {!term && !hasExistingMovies ? (
          <div className={styles.message}>
            <div className={styles.noMoviesText}>
              {translate('HaveNotAddedMovies')}
            </div>
            <div>
              <Button to="/add/import" kind={kinds.PRIMARY}>
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

export default AddNewMovie;
