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
import AddNewStudioSearchResult from './AddNewStudioSearchResult';
import useAddNewStudio from './useAddNewStudio';
import styles from '../../AddMovie/AddNewMovie/AddNewMovie.css';

function AddNewStudio() {
  const {
    error,
    isFetching,
    term,
    studiosWithStatus,
    colorImpairedMode,
    onStudioLookupChange,
    onClearStudioLookupPress,
  } = useAddNewStudio();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // onStudioLookupChange clears the results itself when the box is blank.
  const onSearchInputChange = useCallback(
    ({ value }: { value: string }) => {
      onStudioLookupChange(value);
    },
    [onStudioLookupChange]
  );

  const onClearPress = useCallback(() => {
    onClearStudioLookupPress();
    searchInputRef.current?.focus();
  }, [onClearStudioLookupPress]);

  return (
    <PageContent title={translate('AddNewStudio')}>
      <PageContentBody>
        <div className={styles.searchContainer}>
          <div className={styles.searchIconContainer}>
            <Icon name={icons.SEARCH} size={20} />
          </div>

          <TextInput
            ref={searchInputRef}
            className={styles.searchInput}
            name="studioLookup"
            value={term}
            placeholder="e.g. Blacked, https://stashdb.org/studios/324ea274-1afb-4f80-aa66-c6ddb52b9b56"
            autoFocus={true}
            onChange={onSearchInputChange}
          />

          <Button className={styles.clearLookupButton} onPress={onClearPress}>
            <Icon name={icons.REMOVE} size={20} />
          </Button>
        </div>

        {isFetching && <LoadingIndicator />}

        {!isFetching && !!error ? (
          <div className={styles.message}>
            <div className={styles.helpText}>
              {translate('FailedLoadingSearchResults')}
            </div>
            <Alert kind={kinds.WARNING}>
              {error?.statusBody?.message ?? error?.message ?? ''}
            </Alert>
            <div>
              <Link to="https://wiki.servarr.com/whisparr/troubleshooting#invalid-response-received-from-tmdb">
                {translate('WhySearchesCouldBeFailing')}
              </Link>
            </div>
          </div>
        ) : null}

        {!isFetching && !error && !!studiosWithStatus.length && (
          <div className={styles.searchResults}>
            {studiosWithStatus.map(({ studio, isExistingStudio }) => {
              if (studio) {
                return (
                  <AddNewStudioSearchResult
                    key={studio.foreignId}
                    studio={studio}
                    isExistingStudio={isExistingStudio}
                    colorImpairedMode={colorImpairedMode}
                  />
                );
              }
              return null;
            })}
          </div>
        )}

        {!isFetching && !error && !studiosWithStatus.length && !!term && (
          <div className={styles.message}>
            <div className={styles.noResults}>
              {translate('CouldNotFindResults', { term })}
            </div>
            <div>{translate('YouCanAlsoSearchStudio')}</div>
          </div>
        )}

        {!term && (
          <div className={styles.message}>
            <div className={styles.helpText}>
              {translate('AddNewStudioMessage')}
            </div>
            <div>{translate('AddNewStashIdStudioMessage')}</div>
          </div>
        )}

        <div />
      </PageContentBody>
    </PageContent>
  );
}

export default AddNewStudio;
