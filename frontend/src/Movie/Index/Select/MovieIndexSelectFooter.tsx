import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useSelect } from 'App/SelectContext';
import AppState from 'App/State/AppState';
import { RENAME_MOVIE } from 'Commands/commandNames';
import SpinnerButton from 'Components/Link/SpinnerButton';
import PageContentFooter from 'Components/Page/PageContentFooter';
import { kinds } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import { saveMovieEditor } from 'Store/Actions/movieActions';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import translate from 'Utilities/String/translate';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import { DeleteMovieModal } from './Delete/DeleteMovieModal';
import { useDeleteMovieModalFooterHandler } from './Delete/useDeleteMovieModalFooterHandler';
import EditMoviesModal from './Edit/EditMoviesModal';
import { useEditMoviesModalMutation } from './Edit/useEditMoviesModalMutation';
import OrganizeMoviesModal from './Organize/OrganizeMoviesModal';
import TagsModal from './Tags/TagsModal';
import styles from './MovieIndexSelectFooter.css';

interface SavePayload {
  monitored?: boolean;
  qualityProfileId?: number;
  rootFolderPath?: string;
  searchOnAdd?: boolean;
}

const sceneEditorSelector = createSelector(
  (state: AppState) => state.movies,
  (movies) => {
    // Keep legacy isSaving for other features like tags and delete
    const { isSaving } = movies;

    return {
      isSaving,
    };
  }
);

interface MovieIndexSelectFooterProps {
  items: Movie[];
}

function MovieIndexSelectFooter({
  items,
}: Readonly<MovieIndexSelectFooterProps>) {
  const { isSaving: legacyIsSaving } = useSelector(sceneEditorSelector);
  const isOrganizingMovies = useSelector(
    createCommandExecutingSelector(RENAME_MOVIE)
  );

  const dispatch = useDispatch();
  const editMutation = useEditMoviesModalMutation();

  const [isDeleteMovieModalOpen, setIsDeleteMovieModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);

  const [selectState] = useSelect();
  const { selectedState } = selectState;

  const movieIds = useMemo(() => {
    return getSelectedIds(selectedState);
  }, [selectedState]);

  const selectedCount = movieIds.length ? movieIds.length : 0;

  const onEditPress = useCallback(() => {
    setIsEditModalOpen(true);
  }, [setIsEditModalOpen]);

  const onEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, [setIsEditModalOpen]);

  const onSavePress = useCallback(
    (payload: SavePayload) => {
      setIsEditModalOpen(false);

      editMutation.mutate({
        movieIds,
        ...payload,
      });
    },
    [movieIds, editMutation]
  );

  const onOrganizePress = useCallback(() => {
    setIsOrganizeModalOpen(true);
  }, [setIsOrganizeModalOpen]);

  const onOrganizeModalClose = useCallback(() => {
    setIsOrganizeModalOpen(false);
  }, [setIsOrganizeModalOpen]);

  const onTagsPress = useCallback(() => {
    setIsTagsModalOpen(true);
  }, [setIsTagsModalOpen]);

  const onTagsModalClose = useCallback(() => {
    setIsTagsModalOpen(false);
  }, [setIsTagsModalOpen]);

  const onApplyTagsPress = useCallback(
    (tags: number[], applyTags: string) => {
      setIsSavingTags(true);
      setIsTagsModalOpen(false);

      dispatch(
        saveMovieEditor({
          movieIds,
          tags,
          applyTags,
        })
      );
    },
    [movieIds, dispatch]
  );

  const onDeleteModalClose = useCallback(() => {
    setIsDeleteMovieModalOpen(false);
  }, []);

  const onDeleteSelectedPress = useCallback(() => {
    setIsDeleteMovieModalOpen(true);
  }, []);

  // Handler for when delete is confirmed in modal
  const { onDeletePress, isPending: isDeletePending } =
    useDeleteMovieModalFooterHandler({
      movieIds,
      onModalClose: onDeleteModalClose,
    });

  useEffect(() => {
    // Legacy reducer-based isSaving for tags operation
    if (!legacyIsSaving) {
      setIsSavingTags(false);
    }
  }, [legacyIsSaving]);

  useEffect(() => {
    dispatch(fetchRootFolders());
  }, [dispatch]);

  const anySelected = selectedCount > 0;

  return (
    <PageContentFooter className={styles.footer}>
      <div className={styles.buttons}>
        <div className={styles.actionButtons}>
          <SpinnerButton
            isSpinning={editMutation.isPending}
            isDisabled={!anySelected}
            onPress={onEditPress}
          >
            {translate('Edit')}
          </SpinnerButton>
          <SpinnerButton
            kind={kinds.WARNING}
            isSpinning={isOrganizingMovies}
            isDisabled={!anySelected || isOrganizingMovies}
            onPress={onOrganizePress}
          >
            {translate('RenameFiles')}
          </SpinnerButton>

          <SpinnerButton
            isSpinning={legacyIsSaving && isSavingTags}
            isDisabled={!anySelected}
            onPress={onTagsPress}
          >
            {translate('SetTags')}
          </SpinnerButton>

          <SpinnerButton
            isSpinning={isDeletePending}
            isDisabled={!anySelected}
            kind={kinds.DANGER}
            onPress={onDeleteSelectedPress}
          >
            {translate('Delete')}
          </SpinnerButton>
        </div>
      </div>

      <div className={styles.selected}>
        {translate('MoviesSelectedInterp', { count: selectedCount })}
      </div>

      <EditMoviesModal
        isOpen={isEditModalOpen}
        movieIds={movieIds}
        onSavePress={onSavePress}
        onModalClose={onEditModalClose}
      />

      <TagsModal
        isOpen={isTagsModalOpen}
        movieIds={movieIds}
        items={items}
        onApplyTagsPress={onApplyTagsPress}
        onModalClose={onTagsModalClose}
      />

      <OrganizeMoviesModal
        isOpen={isOrganizeModalOpen}
        movieIds={movieIds}
        items={items}
        onModalClose={onOrganizeModalClose}
      />

      <DeleteMovieModal
        isOpen={isDeleteMovieModalOpen}
        movieIds={movieIds}
        onDeletePress={onDeletePress}
        onModalClose={onDeleteModalClose}
      />
    </PageContentFooter>
  );
}

export default MovieIndexSelectFooter;
