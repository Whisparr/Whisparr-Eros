import _ from 'lodash';
import moment from 'moment';
import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { filterTypePredicates, sortDirections } from 'Helpers/Props';
import { createThunk, handleThunks } from 'Store/thunks';
// import { batchActions } from 'redux-batched-actions';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import dateFilterPredicate from 'Utilities/Date/dateFilterPredicate';
import padNumber from 'Utilities/Number/padNumber';
import { set, updateItem } from './baseActions';
import createHandleActions from './Creators/createHandleActions';
import createRemoveItemHandler from './Creators/createRemoveItemHandler';

//
// Variables

export const section = 'movies';

export const filterPredicates = {
  added: function (item, filterValue, type) {
    return dateFilterPredicate(item.added, filterValue, type);
  },

  collection: function (item, filterValue, type) {
    const predicate = filterTypePredicates[type];
    const { collection } = item;

    return predicate(
      collection && collection.title ? collection.title : '',
      filterValue
    );
  },

  originalLanguage: function (item, filterValue, type) {
    const predicate = filterTypePredicates[type];
    const { originalLanguage } = item;

    return predicate(
      originalLanguage ? originalLanguage.name : '',
      filterValue
    );
  },

  releaseDate: function (item, filterValue, type) {
    return dateFilterPredicate(item.releaseDate, filterValue, type);
  },

  releaseGroups: function (item, filterValue, type) {
    const predicate = filterTypePredicates[type];
    const { statistics = {} } = item;
    const { releaseGroups = [] } = statistics;

    return predicate(releaseGroups, filterValue);
  },

  sizeOnDisk: function (item, filterValue, type) {
    const predicate = filterTypePredicates[type];
    const { statistics = {} } = item;
    const sizeOnDisk =
      statistics && statistics.sizeOnDisk ? statistics.sizeOnDisk : 0;

    return predicate(sizeOnDisk, filterValue);
  },

  tmdbRating: function (item, filterValue, type) {
    const predicate = filterTypePredicates[type];

    const rating = item.ratings.tmdb ? item.ratings.tmdb.value : 0;

    return predicate(rating * 10, filterValue);
  },

  tmdbVotes: function (item, filterValue, type) {
    const predicate = filterTypePredicates[type];

    const rating = item.ratings.tmdb ? item.ratings.tmdb.votes : 0;

    return predicate(rating, filterValue);
  },

  qualityCutoffNotMet: function (item) {
    const { movieFile = {} } = item;

    return movieFile.qualityCutoffNotMet;
  },
};

export const sortPredicates = {
  status: function (item) {
    let result = 0;

    if (item.monitored) {
      result += 4;
    }

    if (item.status === 'announced') {
      result++;
    }

    if (item.status === 'released') {
      result += 3;
    }

    return result;
  },

  movieStatus: function (item) {
    let result = 0;
    let qualityName = '';

    const hasMovieFile = !!item.movieFile;

    if (item.isAvailable) {
      result++;
    }

    if (item.monitored) {
      result += 2;
    }

    if (hasMovieFile) {
      // TODO: Consider Quality Weight for Sorting within status of hasMovie
      if (item.movieFile.qualityCutoffNotMet) {
        result += 4;
      } else {
        result += 8;
      }
      qualityName = item.movieFile.quality.quality.name;
    }

    return padNumber(result.toString(), 2) + qualityName;
  },

  year: function (item) {
    return item.year || undefined;
  },

  releaseDate: function (item, direction) {
    if (item.releaseDate) {
      return moment(item.releaseDate).unix();
    }

    if (direction === sortDirections.DESCENDING) {
      return -1 * Number.MAX_VALUE;
    }

    return Number.MAX_VALUE;
  },

  sizeOnDisk: function (item) {
    const { statistics = {} } = item;

    return statistics.sizeOnDisk || 0;
  },
};

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: true,
  error: null,
  isSaving: false,
  saveError: null,
  isDeleting: false,
  deleteError: null,
  items: [],
  sortKey: 'sortTitle',
  sortDirection: sortDirections.ASCENDING,
  deleteOptions: {
    addImportExclusion: false,
  },
};

export const persistState = ['movies.deleteOptions'];

//
// Actions Types

export const DELETE_MOVIE = 'movies/deleteMovie';
export const SAVE_MOVIE_EDITOR = 'movies/saveMovieEditor';
export const BULK_MONITOR_MOVIE = 'movies/bulkMonitorMovie';

export const SET_DELETE_OPTION = 'movies/setDeleteOption';

export const TOGGLE_MOVIE_MONITORED = 'movies/toggleMovieMonitored';

//
// Action Creators

export const deleteMovie = createThunk(DELETE_MOVIE, (payload) => {
  return {
    ...payload,
    queryParams: {
      deleteFiles: payload.deleteFiles,
      addImportExclusion: payload.addImportExclusion,
    },
  };
});

export const toggleMovieMonitored = createThunk(TOGGLE_MOVIE_MONITORED);
export const saveMovieEditor = createThunk(SAVE_MOVIE_EDITOR);

export const bulkMonitorMovie = createThunk(
  BULK_MONITOR_MOVIE,
  ({ ids, monitored }) => {
    return {
      ids,
      monitored,
      url: `/movie/bulk/monitor?monitored=${monitored}`,
      method: 'PATCH',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(ids),
      queryParams: { monitored },
    };
  }
);

export const setDeleteOption = createAction(SET_DELETE_OPTION);

//
// Action Handlers

export const actionHandlers = handleThunks({
  [DELETE_MOVIE]: (getState, payload, dispatch) => {
    createRemoveItemHandler(section, '/movie')(getState, payload, dispatch);

    if (!payload.collectionTmdbId) {
      return;
    }

    const collectionToUpdate = getState().movieCollections.items.find(
      (collection) => collection.tmdbId === payload.collectionTmdbId
    );

    if (!collectionToUpdate) {
      return;
    }

    // Skip updating if the last movie in the collection is being deleted
    if (
      collectionToUpdate.movies.length - collectionToUpdate.missingMovies ===
      1
    ) {
      return;
    }

    const collectionData = {
      ...collectionToUpdate,
      missingMovies: collectionToUpdate.missingMovies + 1,
    };

    dispatch(
      updateItem({
        section: 'movieCollections',
        ...collectionData,
      })
    );
  },

  [TOGGLE_MOVIE_MONITORED]: (getState, payload, dispatch) => {
    const { movieId: id, monitored } = payload;

    const movie = _.find(getState().movies.items, { id });

    dispatch(
      updateItem({
        id,
        section,
        isSaving: true,
      })
    );

    const promise = createAjaxRequest({
      url: `/movie/${id}`,
      method: 'PUT',
      data: JSON.stringify({
        ...movie,
        monitored,
      }),
      dataType: 'json',
    }).request;

    promise.done((data) => {
      dispatch(
        updateItem({
          id,
          section,
          isSaving: false,
          monitored,
        })
      );
    });

    promise.fail((xhr) => {
      dispatch(
        updateItem({
          id,
          section,
          isSaving: false,
        })
      );
    });
  },

  [BULK_MONITOR_MOVIE]: (getState, payload, dispatch) => {
    const { ids, monitored } = payload;

    ids.forEach((id) => {
      dispatch(updateItem({ id, section, isSaving: true, monitored }));
    });

    const promise = createAjaxRequest(payload).request; // reuse the request object

    promise.done(() => {
      ids.forEach((id) => {
        dispatch(updateItem({ id, section, isSaving: false, monitored }));
      });
    });

    promise.fail(() => {
      ids.forEach((id) => {
        dispatch(updateItem({ id, section, isSaving: false }));
      });
    });
  },

  [SAVE_MOVIE_EDITOR]: function (getState, payload, dispatch) {
    dispatch(
      set({
        section,
        isSaving: true,
      })
    );

    const promise = createAjaxRequest({
      url: '/movie/editor',
      method: 'PUT',
      data: JSON.stringify(payload),
      dataType: 'json',
    }).request;

    promise.done((data) => {
      dispatch(
        batchActions([
          ...data.map((movie) => {
            return updateItem({
              id: movie.id,
              section: 'movies',
              ...movie,
            });
          }),

          set({
            section,
            isSaving: false,
            saveError: null,
          }),
        ])
      );
    });

    promise.fail((xhr) => {
      dispatch(
        set({
          section,
          isSaving: false,
          saveError: xhr,
        })
      );
    });
  },

});

//
// Reducers

export const reducers = createHandleActions(
  {
    [SET_DELETE_OPTION]: (state, { payload }) => {
      return {
        ...state,
        deleteOptions: {
          ...payload,
        },
      };
    },
    // Batch update handler: efficiently updates multiple items in one state edit
    UPDATE_ITEMS_BATCH: (state, { payload }) => {
      // payload: array of updated movie objects, each with an id
      const updatedMap = {};
      payload.forEach((item) => {
        updatedMap[item.id] = item;
      });
      return {
        ...state,
        items: state.items.map((item) =>
          updatedMap[item.id] ? { ...item, ...updatedMap[item.id] } : item
        ),
      };
    },
  },
  defaultState,
  section
);
