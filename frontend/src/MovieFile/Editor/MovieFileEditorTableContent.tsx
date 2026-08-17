import React from 'react';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';
import { MovieFile } from '../MovieFile';
import MovieFileEditorRow from './MovieFileEditorRow';
import styles from './MovieFileEditorTableContent.css';

export interface MovieFileEditorTableContentProps {
  movieId?: number;
  isDeleting: boolean;
  items: readonly MovieFile[];
  columns: Column[];
  sortKey: string;
  sortDirection: SortDirection;
  onTableOptionChange: (option: unknown) => void;
  onSortPress: (name: string, sortDirection?: SortDirection) => void;
  onDeletePress: (id: number) => void;
  isLoading?: boolean;
  error?: unknown;
}

function MovieFileEditorTableContent({
  items,
  columns,
  sortKey,
  sortDirection,
  onSortPress,
  onTableOptionChange,
  onDeletePress,
  isLoading,
  error,
}: Readonly<MovieFileEditorTableContentProps>) {
  if (isLoading) {
    return <div className={styles.blankpad}>{translate('Loading')}</div>;
  }
  if (error) {
    return (
      <div className={styles.blankpad}>{translate('MovieFilesLoadError')}</div>
    );
  }
  return (
    <div>
      {!items.length && (
        <div className={styles.blankpad}>
          {translate('NoMovieFilesToManage')}
        </div>
      )}

      {!!items.length && (
        <Table
          columns={columns}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortPress={onSortPress}
          onTableOptionChange={onTableOptionChange}
        >
          <TableBody>
            {items.map((item) => {
              return (
                <MovieFileEditorRow
                  key={item.id}
                  movieFile={item}
                  columns={columns}
                  id={item.id}
                  quality={item.quality}
                  indexerFlags={item.indexerFlags}
                  size={item.size ?? 0}
                  relativePath={item.relativePath ?? ''}
                  customFormats={item.customFormats}
                  languages={item.languages}
                  mediaInfo={item.mediaInfo}
                  dateAdded={item.dateAdded}
                  releaseGroup={item.releaseGroup}
                  onDeletePress={onDeletePress}
                />
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
export default MovieFileEditorTableContent;
