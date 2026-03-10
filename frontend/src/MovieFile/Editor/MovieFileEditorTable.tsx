import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { SortDirection } from 'Helpers/Props/sortDirections';
import {
  deleteMovieFile,
  setMovieFilesSort,
  setMovieFilesTableOption,
} from 'Store/Actions/movieFileActions';
import translate from 'Utilities/String/translate';
import useMovieFile from '../useMovieFile';
import MovieFileEditorTableContent from './MovieFileEditorTableContent';
import styles from './MovieFileEditorTable.css';

export interface MovieFileEditorTableProps {
  movieId: number;
}

function MovieFileEditorTable({ movieId }: MovieFileEditorTableProps) {
  const dispatch = useDispatch();
  const { columns, sortKey, sortDirection, isDeleting } = useSelector(
    (state: AppState) => state.movieFiles
  );

  const { data: items, isLoading, isError, error } = useMovieFile(movieId);

  const onDeletePress = useCallback(
    (id: number) => {
      dispatch(deleteMovieFile({ id }));
    },
    [dispatch]
  );

  const onTableOptionChange = useCallback(
    (payload: unknown) => {
      dispatch(setMovieFilesTableOption(payload));
    },
    [dispatch]
  );

  const onSortPress = useCallback(
    (name: string, newSortDirection?: SortDirection) => {
      dispatch(
        setMovieFilesSort({
          sortKey: name,
          sortDirection: newSortDirection ?? sortDirection,
        })
      );
    },
    [dispatch, sortDirection]
  );

  if (isError) {
    return (
      <div className={styles.container}>
        <Alert kind="danger">{`${translate('LoadingMovieFilesFailed')}: ${
          (error as Error)?.message || translate('UnknownError')
        }`}</Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MovieFileEditorTableContent
        items={items ?? []}
        columns={columns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        isDeleting={isDeleting}
        onDeletePress={onDeletePress}
        onTableOptionChange={onTableOptionChange}
        onSortPress={onSortPress}
      />
    </div>
  );
}

export default MovieFileEditorTable;
