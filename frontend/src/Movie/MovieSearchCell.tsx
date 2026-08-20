import React, { useCallback } from 'react';
import { MOVIE_SEARCH } from 'Commands/commandNames';
import { useExecuteCommand, useExecutingCommands } from 'Commands/useCommands';
import IconButton from 'Components/Link/IconButton';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import useModalOpenState from 'Helpers/Hooks/useModalOpenState';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import Movie from './Movie';
import MovieInteractiveSearchModal from './Search/MovieInteractiveSearchModal';
import styles from './MovieSearchCell.css';

interface MovieSearchCellProps {
  movieId: number;
  movieEntity?: Movie;
}

function MovieSearchCell({ movieId }: MovieSearchCellProps) {
  const executingCommands = useExecutingCommands();
  const isSearching = executingCommands.some(({ name, body }) => {
    const { movieIds = [] } = body;
    return name === MOVIE_SEARCH && movieIds.indexOf(movieId) > -1;
  });

  const executeCommand = useExecuteCommand();

  const [
    isInteractiveSearchModalOpen,
    setInteractiveSearchModalOpen,
    setInteractiveSearchModalClosed,
  ] = useModalOpenState(false);

  const handleSearchPress = useCallback(() => {
    executeCommand({
      name: MOVIE_SEARCH,
      movieIds: [movieId],
    });
  }, [movieId, executeCommand]);

  return (
    <TableRowCell className={styles.movieSearchCell}>
      <SpinnerIconButton
        name={icons.SEARCH}
        isSpinning={isSearching}
        title={translate('AutomaticSearch')}
        onPress={handleSearchPress}
      />

      <IconButton
        name={icons.INTERACTIVE}
        title={translate('InteractiveSearch')}
        onPress={setInteractiveSearchModalOpen}
      />

      <MovieInteractiveSearchModal
        isOpen={isInteractiveSearchModalOpen}
        movieId={movieId}
        onModalClose={setInteractiveSearchModalClosed}
      />
    </TableRowCell>
  );
}

export default MovieSearchCell;
