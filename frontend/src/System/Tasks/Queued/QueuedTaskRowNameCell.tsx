import React, { useMemo } from 'react';
import { CommandBody } from 'Commands/Command';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import { useMoviesByIds } from 'Movie/useMovie';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import styles from './QueuedTaskRowNameCell.css';

export interface QueuedTaskRowNameCellProps {
  commandName: string;
  body: CommandBody;
  clientUserAgent?: string;
}

export default function QueuedTaskRowNameCell(
  props: Readonly<QueuedTaskRowNameCellProps>
) {
  const { commandName, body, clientUserAgent } = props;

  const movieIds = useMemo(() => {
    const ids = [...(body.movieIds ?? [])];

    if (body.movieId) {
      ids.push(body.movieId);
    }

    return ids;
  }, [body.movieIds, body.movieId]);

  const { movies } = useMoviesByIds(movieIds);

  // `movies` is React Query's cached array; sorting in place would reorder it
  // for every other reader of the same key.
  const sortedMovies = useMemo(
    () => [...movies].sort(sortByProp('sortTitle')),
    [movies]
  );

  return (
    <TableRowCell>
      <span className={styles.commandName}>
        {commandName}
        {sortedMovies.length ? (
          <span> - {sortedMovies.map((m) => m?.title)?.join(', ')}</span>
        ) : null}
      </span>

      {clientUserAgent ? (
        <span
          className={styles.userAgent}
          title={translate('TaskUserAgentTooltip')}
        >
          {translate('From')}: {clientUserAgent}
        </span>
      ) : null}
    </TableRowCell>
  );
}
