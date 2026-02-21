import React from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { kinds } from 'Helpers/Props';
import { AlternativeTitle } from 'Movie/Movie';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import MovieTitlesRow from './MovieTitlesRow';
import styles from './MovieTitlesTable.css';

const columns: Column[] = [
  {
    name: 'alternativeTitle',
    label: () => translate('AlternativeTitle'),
    isVisible: true,
  },
  {
    name: 'sourceType',
    label: () => translate('Type'),
    isVisible: true,
  },
];

interface MovieTitlesProps {
  alternateTitles: AlternativeTitle[];
  isLoading: boolean;
  error: unknown;
}

function MovieTitlesTable({
  alternateTitles,
  isLoading,
  error,
}: MovieTitlesProps) {
  const sortedItems = alternateTitles.slice().sort(sortByProp('title'));

  if (!isLoading && !!error) {
    return (
      <Alert kind={kinds.DANGER}>
        {translate('AlternativeTitlesLoadError')}
      </Alert>
    );
  }

  return (
    <div className={styles.container}>
      {isLoading && <LoadingIndicator />}

      {!isLoading && !alternateTitles.length && !error ? (
        <div className={styles.blankpad}>
          {translate('NoAlternativeTitles')}
        </div>
      ) : null}

      {!isLoading && !!alternateTitles.length && !error ? (
        <Table columns={columns}>
          <TableBody>
            {sortedItems.map((item) => (
              <MovieTitlesRow
                key={item.id}
                title={item.title}
                sourceType={item.sourceType}
              />
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  );
}

export default MovieTitlesTable;
