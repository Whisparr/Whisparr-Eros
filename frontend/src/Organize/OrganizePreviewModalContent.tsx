import React, { useCallback, useMemo } from 'react';
import * as commandNames from 'Commands/commandNames';
import { useExecuteCommand } from 'Commands/useCommands';
import Alert from 'Components/Alert';
import CheckInput from 'Components/Form/CheckInput';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import useSelectState from 'Helpers/Hooks/useSelectState';
import { kinds } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import { useMovie } from 'Movie/useMovie';
import { useNamingSettings } from 'Settings/MediaManagement/Naming/useNamingSettings';
import { CheckInputChanged } from 'typings/inputs';
import { SelectStateInputProps } from 'typings/props';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import OrganizePreviewRow from './OrganizePreviewRow';
import useOrganizePreview, {
  OrganizePreviewModel,
  OrganizePreviewScope,
} from './useOrganizePreview';
import styles from './OrganizePreviewModalContent.css';

function getValue(allSelected: boolean, allUnselected: boolean) {
  if (allSelected) {
    return true;
  } else if (allUnselected) {
    return false;
  }

  return null;
}

interface PreviewGroup {
  movieId: number;
  title: string;
  previews: OrganizePreviewModel[];
}

// A performer or studio preview spans many titles, so rows are grouped under
// each title's heading, using the works the details page has already loaded.
function groupPreviews(
  items: readonly OrganizePreviewModel[],
  movies: readonly Movie[]
): PreviewGroup[] {
  const moviesById = new Map(movies.map((m) => [m.id, m]));
  const groups = new Map<number, PreviewGroup>();

  items.forEach((item) => {
    let group = groups.get(item.movieId);

    if (!group) {
      group = {
        movieId: item.movieId,
        title: moviesById.get(item.movieId)?.title ?? '',
        previews: [],
      };

      groups.set(item.movieId, group);
    }

    group.previews.push(item);
  });

  return [...groups.values()].sort((a, b) => {
    const aSort = moviesById.get(a.movieId)?.sortTitle ?? a.title;
    const bSort = moviesById.get(b.movieId)?.sortTitle ?? b.title;

    return aSort.localeCompare(bSort);
  });
}

export type OrganizePreviewModalContentProps =
  | { movieId: number; onModalClose: () => void }
  | ((
      | { performerForeignId: string; studioForeignId?: never }
      | { studioForeignId: string; performerForeignId?: never }
    ) & {
      movieId?: never;
      items: readonly Movie[];
      onModalClose: () => void;
    });

function getScope(
  props: Readonly<OrganizePreviewModalContentProps>
): OrganizePreviewScope {
  if (props.movieId !== undefined) {
    return { movieId: props.movieId };
  }

  if (props.performerForeignId === undefined) {
    return { studioForeignId: props.studioForeignId };
  }

  return { performerForeignId: props.performerForeignId };
}

function OrganizePreviewModalContent(
  props: Readonly<OrganizePreviewModalContentProps>
) {
  const { movieId, onModalClose } = props;
  const works = movieId === undefined ? props.items : undefined;

  const scope = getScope(props);

  const executeCommand = useExecuteCommand();
  const {
    items,
    isFetching: isPreviewFetching,
    isFetched: isPreviewFetched,
    error: previewError,
  } = useOrganizePreview(scope);

  const {
    data: naming,
    isFetching: isNamingFetching,
    isFetched: isNamingFetched,
    error: namingError,
  } = useNamingSettings();

  const movie = useMovie(movieId).data;
  const [selectState, setSelectState] = useSelectState();

  const { allSelected, allUnselected, selectedState } = selectState;
  const isFetching = isPreviewFetching || isNamingFetching;
  const isPopulated = isPreviewFetched && isNamingFetched;
  const error = previewError || namingError;
  const { renameMovies, standardMovieFormat, standardSceneFormat } = naming;

  const groups = useMemo(
    () => (works ? groupPreviews(items, works) : undefined),
    [items, works]
  );

  // Only show the naming patterns for the kinds of title being renamed
  const { hasMovies, hasScenes } = useMemo(() => {
    if (!works) {
      return { hasMovies: false, hasScenes: false };
    }

    const itemTypes = new Map(works.map((m) => [m.id, m.itemType]));
    const previewTypes = new Set(items.map((i) => itemTypes.get(i.movieId)));

    return {
      hasScenes: previewTypes.has('scene'),
      hasMovies: [...previewTypes].some((t) => t !== 'scene'),
    };
  }, [items, works]);

  const selectAllValue = getValue(allSelected, allUnselected);

  const handleSelectAllChange = useCallback(
    ({ value }: CheckInputChanged) => {
      setSelectState({ type: value ? 'selectAll' : 'unselectAll', items });
    },
    [items, setSelectState]
  );

  const handleSelectedChange = useCallback(
    ({ id, value, shiftKey = false }: SelectStateInputProps) => {
      setSelectState({
        type: 'toggleSelected',
        items,
        id,
        isSelected: value,
        shiftKey,
      });
    },
    [items, setSelectState]
  );

  const handleOrganizePress = useCallback(() => {
    const files = getSelectedIds(selectedState);

    executeCommand({
      name: commandNames.RENAME_FILES,
      files,
      ...(movieId === undefined ? {} : { movieId }),
    });

    onModalClose();
  }, [movieId, selectedState, onModalClose, executeCommand]);

  if (movieId !== undefined && !movie) {
    return null;
  }

  const renderRow = (item: OrganizePreviewModel) => (
    <OrganizePreviewRow
      key={item.movieFileId}
      id={item.movieFileId}
      existingPath={item.existingPath}
      newPath={item.newPath}
      isSelected={selectedState[item.movieFileId]}
      onSelectedChange={handleSelectedChange}
    />
  );

  return (
    <ModalContent onModalClose={onModalClose}>
      <ModalHeader>{translate('OrganizeModalHeader')}</ModalHeader>

      <ModalBody>
        {isFetching ? <LoadingIndicator /> : null}

        {!isFetching && error ? (
          <Alert kind={kinds.DANGER}>{translate('OrganizeLoadError')}</Alert>
        ) : null}

        {!isFetching && isPopulated && !items.length ? (
          <div>
            {renameMovies ? (
              <div>{translate('OrganizeNothingToRename')}</div>
            ) : (
              <div>{translate('OrganizeRenamingDisabled')}</div>
            )}
          </div>
        ) : null}

        {!isFetching && isPopulated && items.length ? (
          <div>
            {groups ? (
              <Alert>
                <div>{translate('OrganizeRelativePathsPerTitle')}</div>

                {hasMovies ? (
                  <div>
                    <InlineMarkdown
                      data={translate('OrganizeMovieNamingPattern', {
                        standardMovieFormat,
                      })}
                      blockClassName={styles.standardMovieFormat}
                    />
                  </div>
                ) : null}

                {hasScenes ? (
                  <div>
                    <InlineMarkdown
                      data={translate('OrganizeSceneNamingPattern', {
                        standardSceneFormat,
                      })}
                      blockClassName={styles.standardMovieFormat}
                    />
                  </div>
                ) : null}
              </Alert>
            ) : (
              <Alert>
                <div>
                  <InlineMarkdown
                    data={translate('OrganizeRelativePaths', {
                      path: movie?.path ?? '',
                    })}
                    blockClassName={styles.path}
                  />
                </div>

                <div>
                  <InlineMarkdown
                    data={translate('OrganizeNamingPattern', {
                      standardMovieFormat,
                    })}
                    blockClassName={styles.standardMovieFormat}
                  />
                </div>
              </Alert>
            )}

            <div className={styles.previews}>
              {groups
                ? groups.map((group) => (
                    <div key={group.movieId} className={styles.group}>
                      <div className={styles.groupTitle}>{group.title}</div>

                      {group.previews.map(renderRow)}
                    </div>
                  ))
                : items.map(renderRow)}
            </div>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        {isPopulated && items.length ? (
          <CheckInput
            className={styles.selectAllInput}
            containerClassName={styles.selectAllInputContainer}
            name="selectAll"
            ariaLabel={translate('SelectAll')}
            value={selectAllValue}
            onChange={handleSelectAllChange}
          />
        ) : null}

        <Button onPress={onModalClose}>{translate('Cancel')}</Button>

        <Button kind={kinds.PRIMARY} onPress={handleOrganizePress}>
          {translate('Organize')}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
}

export default OrganizePreviewModalContent;
