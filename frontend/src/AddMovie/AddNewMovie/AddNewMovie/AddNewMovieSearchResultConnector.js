import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import createExistingMovieSelector from 'Store/Selectors/createExistingMovieSelector';
import AddNewMovieSearchResult from './AddNewMovieSearchResult';

function createMapStateToProps() {
  return createSelector(
    createExistingMovieSelector(),
    createDimensionsSelector(),
    (state) => state.queue.details.items,
    (state) => state.movieFiles.items,
    (state, { internalId }) => internalId,
    (state, { foreignId }) => state.movies.items.find((m) => m.foreignId === foreignId),
    (state) => state.settings.ui.item.movieRuntimeFormat,
    (state) => state.settings.safeForWorkMode,
    (isExistingMovie, dimensions, queueItems, movieFiles, internalId, existingMovie, movieRuntimeFormat, safeForWorkMode) => {
      const resolvedId = existingMovie ? existingMovie.id : internalId;
      const queueItem = queueItems.find((item) => resolvedId > 0 && item.movieId === resolvedId);
      const movieFile = movieFiles.find((item) => resolvedId > 0 && item.movieId === resolvedId);

      return {
        existingMovieId: resolvedId,
        isExistingMovie,
        isSmallScreen: dimensions.isSmallScreen,
        queueItem,
        movieRuntimeFormat,
        safeForWorkMode,
        movieFile
      };
    }
  );
}

export default connect(createMapStateToProps)(AddNewMovieSearchResult);
