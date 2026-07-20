import _ from 'lodash';
import { createSelector } from 'reselect';
import movieEntities from 'Movie/movieEntities';

export function createMovieByEntitySelector() {
  return createSelector(
    (state, { movieId }) => movieId,
    (state, { movieEntity = movieEntities.MOVIES }) =>
      _.get(state, movieEntity, { items: [] }),
    (movieId, movies) => {
      return _.find(movies.items, { id: movieId });
    }
  );
}

function createMovieSelector() {
  return createSelector(
    (state, { movieId }) => movieId,
    (state) => state.movies.itemMap || {},
    (state) => state.movies.items || {},
    (movieId, itemMap, allMovies) => {
      return allMovies[itemMap[movieId]];
    }
  );
}

export default createMovieSelector;
