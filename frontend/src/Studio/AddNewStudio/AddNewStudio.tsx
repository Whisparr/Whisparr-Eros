import React, { useCallback, useState } from 'react';
import Alert from 'Components/Alert';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import { icons, kinds } from 'Helpers/Props';
import getErrorMessage from 'Utilities/Object/getErrorMessage';
import translate from 'Utilities/String/translate';
import AddNewStudioSearchResult from './AddNewStudioSearchResult';
import useAddNewStudio from './useAddNewStudio';
import styles from '../../AddMovie/AddNewMovie/AddNewMovie.css';

interface AddNewStudioProps {
  term?: string;
}

function AddNewStudio(props: AddNewStudioProps) {
  const {
    error,
    isFetching,
    studiosWithStatus,
    colorImpairedMode,
    onStudioLookupChange,
    onClearStudioLookupPress,
  } = useAddNewStudio();

  const [term, setTerm] = useState(props.term || '');

  React.useEffect(() => {
    if (props.term && props.term !== term) {
      setTerm(props.term);
      onStudioLookupChange(props.term);
    }
  }, [props.term, term, onStudioLookupChange]);

  const onSearchInputChange = useCallback(
    ({ value }: { value: string }) => {
      const hasValue = !!value.trim();
      setTerm(value);
      if (hasValue) {
        onStudioLookupChange(value);
      } else {
        onClearStudioLookupPress();
      }
    },
    [onStudioLookupChange, onClearStudioLookupPress]
  );

  const onClearPress = useCallback(() => {
    setTerm('');
    onClearStudioLookupPress();
  }, [onClearStudioLookupPress]);

  return (
    <PageContent title={translate('AddNewStudio')}>
      <PageContentBody>
        <div className={styles.searchContainer}>
          <div className={styles.searchIconContainer}>
            <Icon name={icons.SEARCH} size={20} />
          </div>

          <TextInput
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
            <Alert kind={kinds.WARNING}>{getErrorMessage(error)}</Alert>
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
