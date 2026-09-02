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
import Performer from 'Performer/Performer';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import AddNewPerformerSearchResult from './AddNewPerformerSearchResult';
import useAddNewPerformer from './useAddNewPerformer';
import styles from '../../AddMovie/AddNewMovie/AddNewMovie.css';

function AddNewPerformer() {
  const {
    error,
    isFetching,
    term,
    performersWithStatus,
    onPerformerLookupChange,
    onClearPerformerLookupPress,
  } = useAddNewPerformer();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = useCallback(
    (e: { name: string; value: string }) => {
      onPerformerLookupChange(e.value);
    },
    [onPerformerLookupChange]
  );

  const handleClearPress = useCallback(() => {
    onClearPerformerLookupPress();
    searchInputRef.current?.focus();
  }, [onClearPerformerLookupPress]);

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
            placeholder="e.g. Angela White, https://stashdb.org/performers/155f2559-d1f1-42b1-8cbe-9008542df5ce"
            autoFocus={true}
            onChange={handleInputChange}
          />

          <Button
            className={styles.clearLookupButton}
            onPress={handleClearPress}
          >
            <Icon name={icons.REMOVE} size={20} />
          </Button>
        </div>

        {isFetching && <LoadingIndicator />}

        {!isFetching && !!error ? (
          <div className={styles.message}>
            <div className={styles.helpText}>
              {translate('YouCanAlsoSearchPerformer')}
            </div>
            <Alert kind={kinds.WARNING}>{getErrorMessage(error)}</Alert>
            <div>
              <Link to="https://wiki.servarr.com/whisparr/troubleshooting#invalid-response-received-from-tmdb">
                {translate('WhySearchesCouldBeFailing')}
              </Link>
            </div>
          </div>
        ) : null}

        {!isFetching && !error && !!performersWithStatus.length && (
          <div className={styles.searchResults}>
            {performersWithStatus.map(
              ({
                performer,
                isExistingPerformer,
              }: {
                performer: Performer;
                isExistingPerformer: boolean;
              }) => {
                if (performer) {
                  return (
                    <AddNewPerformerSearchResult
                      key={performer.foreignId}
                      performer={performer}
                      isExistingPerformer={isExistingPerformer}
                    />
                  );
                }
                return null;
              }
            )}
          </div>
        )}

        {!isFetching && !error && !performersWithStatus.length && !!term && (
          <div className={styles.message}>
            <div className={styles.noResults}>
              {translate('CouldNotFindResults', { term })}
            </div>
            <div>{translate('YouCanAlsoSearch')}</div>
            <div>
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

        <div />
      </PageContentBody>
    </PageContent>
  );
}

export default AddNewPerformer;
