import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'Components/Alert';
import CheckInput from 'Components/Form/CheckInput';
import TextInput from 'Components/Form/TextInput';
import Button from 'Components/Link/Button';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import { NONE } from 'Helpers/Props/scrollDirections';
import { CheckInputChanged, InputChanged } from 'typings/inputs';
import { ReviewCandidate } from 'typings/Review';
import translate from 'Utilities/String/translate';
import { useReviewLookup, useReviewScenes } from '../useReview';
import SelectReviewSceneTable from './SelectReviewSceneTable';
import styles from './SelectReviewSceneModalContent.module.css';

// Searching every studio or StashDB needs a few characters, the studio's own
// scenes are listed straight away.
const MIN_QUERY_LENGTH = 3;

type SceneSource = 'library' | 'stashDb';

export interface SelectReviewSceneModalContentProps {
  reviewId: number;
  releaseTitle: string;
  studioTitle?: string;
  lookupTerm?: string;
  candidateIds: number[];
  onSceneSelect(scene: ReviewCandidate): void;
  onModalClose(): void;
}

function useDebouncedValue(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue.trim());

  const debouncedSet = useMemo(
    () => debounce((next: string) => setDebouncedValue(next.trim()), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSet.cancel();
    };
  }, [debouncedSet]);

  const handleChange = useCallback(
    ({ value: next }: InputChanged<string>) => {
      setValue(next);
      debouncedSet(next);
    },
    [debouncedSet]
  );

  return { value, debouncedValue, handleChange };
}

interface ScenesProps {
  reviewId: number;
  candidateIds: number[];
  onSceneSelect(scene: ReviewCandidate): void;
}

interface LibraryScenesProps extends ScenesProps {
  studioTitle?: string;
}

function LibraryScenes({
  reviewId,
  studioTitle,
  candidateIds,
  onSceneSelect,
}: LibraryScenesProps) {
  const { value, debouncedValue, handleChange } = useDebouncedValue('');
  const [isStudioOnly, setIsStudioOnly] = useState(!!studioTitle);

  const canSearch = isStudioOnly || debouncedValue.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isFetched, error } = useReviewScenes(
    reviewId,
    debouncedValue,
    !isStudioOnly,
    canSearch
  );

  const scenes = canSearch ? (data ?? []) : [];

  const handleStudioOnlyChange = useCallback(({ value }: CheckInputChanged) => {
    setIsStudioOnly(value);
  }, []);

  return (
    <>
      <TextInput
        className={styles.filterInput}
        placeholder={
          isStudioOnly
            ? translate('ReviewChooseSceneFilterPlaceholder')
            : translate('ReviewChooseSceneSearchAllPlaceholder')
        }
        name="filter"
        value={value}
        autoFocus={true}
        onChange={handleChange}
      />

      {studioTitle ? (
        <div className={styles.studioFilter}>
          <CheckInput
            name="studioOnly"
            value={isStudioOnly}
            helpText={translate('ReviewChooseSceneOnlyStudio', {
              studio: studioTitle,
            })}
            onChange={handleStudioOnlyChange}
          />
        </div>
      ) : null}

      {canSearch && isFetching && !isFetched ? <LoadingIndicator /> : null}

      {canSearch && !!error ? (
        <Alert kind={kinds.DANGER}>
          {translate('ReviewChooseSceneLoadError')}
        </Alert>
      ) : null}

      {canSearch ? null : (
        <div className={styles.hint}>
          {translate('ReviewChooseSceneSearchAllHint', {
            count: MIN_QUERY_LENGTH,
          })}
        </div>
      )}

      {canSearch && isFetched && !error && !scenes.length ? (
        <div className={styles.hint}>{translate('NoResultsFound')}</div>
      ) : null}

      <SelectReviewSceneTable
        scenes={scenes}
        candidateIds={candidateIds}
        onSceneSelect={onSceneSelect}
      />
    </>
  );
}

interface StashDbScenesProps extends ScenesProps {
  lookupTerm?: string;
}

function StashDbScenes({
  reviewId,
  lookupTerm = '',
  candidateIds,
  onSceneSelect,
}: StashDbScenesProps) {
  const { value, debouncedValue, handleChange } = useDebouncedValue(lookupTerm);

  const canSearch = debouncedValue.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isFetched, error } = useReviewLookup(
    reviewId,
    debouncedValue,
    canSearch
  );

  const scenes = canSearch ? (data ?? []) : [];

  return (
    <>
      <TextInput
        className={styles.filterInput}
        placeholder={translate('ReviewChooseSceneStashDbPlaceholder')}
        name="lookup"
        value={value}
        autoFocus={true}
        onChange={handleChange}
      />

      <div className={styles.hint}>
        {translate('ReviewChooseSceneStashDbHint')}
      </div>

      {canSearch && isFetching ? <LoadingIndicator /> : null}

      {canSearch && !isFetching && !!error ? (
        <Alert kind={kinds.DANGER}>
          {translate('ReviewChooseSceneStashDbError')}
        </Alert>
      ) : null}

      {canSearch && isFetched && !isFetching && !error && !scenes.length ? (
        <div className={styles.hint}>{translate('NoResultsFound')}</div>
      ) : null}

      {isFetching ? null : (
        <SelectReviewSceneTable
          scenes={scenes}
          candidateIds={candidateIds}
          onSceneSelect={onSceneSelect}
        />
      )}
    </>
  );
}

function SelectReviewSceneModalContent(
  props: SelectReviewSceneModalContentProps
) {
  const {
    reviewId,
    releaseTitle,
    studioTitle,
    lookupTerm,
    candidateIds,
    onSceneSelect,
    onModalClose,
  } = props;

  const [source, setSource] = useState<SceneSource>('library');

  const handleLibraryPress = useCallback(() => {
    setSource('library');
  }, []);

  const handleStashDbPress = useCallback(() => {
    setSource('stashDb');
  }, []);

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('ReviewChooseSceneModalTitle')}</ModalHeader>

      <ModalBody className={styles.modalBody} scrollDirection={NONE}>
        <ul className={styles.tabList}>
          <li>
            <Link
              className={source === 'library' ? styles.selectedTab : styles.tab}
              onPress={handleLibraryPress}
            >
              {translate('ReviewChooseSceneLibraryTab')}
            </Link>
          </li>

          <li>
            <Link
              className={source === 'stashDb' ? styles.selectedTab : styles.tab}
              onPress={handleStashDbPress}
            >
              {translate('ReviewChooseSceneStashDbTab')}
            </Link>
          </li>
        </ul>

        {source === 'library' ? (
          <LibraryScenes
            reviewId={reviewId}
            studioTitle={studioTitle}
            candidateIds={candidateIds}
            onSceneSelect={onSceneSelect}
          />
        ) : (
          <StashDbScenes
            reviewId={reviewId}
            lookupTerm={lookupTerm}
            candidateIds={candidateIds}
            onSceneSelect={onSceneSelect}
          />
        )}
      </ModalBody>

      <ModalFooter className={styles.footer}>
        <div className={styles.release}>{releaseTitle}</div>
        <Button onPress={onModalClose}>{translate('Cancel')}</Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default SelectReviewSceneModalContent;
