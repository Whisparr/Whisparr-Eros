import React, { useCallback, useMemo } from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { TableOptionsChangePayload } from 'typings/Table';
import clientSideFilterAndSort from 'Utilities/Filter/clientSideFilterAndSort';
import translate from 'Utilities/String/translate';
import useMovieFile, { useDeleteMovieFile } from '../useMovieFile';
import {
  setMovieFileEditorOptions,
  setMovieFileEditorSort,
  useMovieFileEditorOptions,
} from './movieFileEditorOptionsStore';
import MovieFileEditorTableContent from './MovieFileEditorTableContent';
import styles from './MovieFileEditorTable.css';

export interface MovieFileEditorTableProps {
  movieId: number;
}

function MovieFileEditorTable({ movieId }: MovieFileEditorTableProps) {
  const { columns, sortKey, sortDirection } = useMovieFileEditorOptions();

  const { data: items, isLoading, isError, error } = useMovieFile(movieId);
  const { mutate: deleteMovieFile } = useDeleteMovieFile();

  // The table hands the header its sort key and direction; nothing applied
  // them to the rows, so every column header was inert.
  const sortedItems = useMemo(() => {
    return clientSideFilterAndSort(items ?? [], { sortKey, sortDirection })
      .data;
  }, [items, sortKey, sortDirection]);

  const handleDeletePress = useCallback(
    (id: number) => {
      deleteMovieFile({ id });
    },
    [deleteMovieFile]
  );

  const handleTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      setMovieFileEditorOptions(payload);
    },
    []
  );

  const handleSortPress = useCallback(
    (name: string, newSortDirection?: SortDirection) => {
      setMovieFileEditorSort({
        sortKey: name,
        sortDirection: newSortDirection,
      });
    },
    []
  );

  if (isError) {
    return (
      <div className={styles.container}>
        <Alert kind="danger">{`${translate('LoadingMovieFilesFailed')}: ${
          error?.message || translate('UnknownError')
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
        items={sortedItems}
        columns={columns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onDeletePress={handleDeletePress}
        onTableOptionChange={handleTableOptionChange}
        onSortPress={handleSortPress}
      />
    </div>
  );
}

export default MovieFileEditorTable;
