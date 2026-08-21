import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import Movie from 'Movie/Movie';
import Performer from 'Performer/Performer';
import ImportList from 'typings/ImportList';
import createAllItemsSelector from './createAllItemsSelector';

function createProfileInUseSelector(profileProp: string) {
  return createSelector(
    (_: AppState, { id }: { id: number }) => id,
    createAllItemsSelector(),
    (state: AppState) => state.settings.importLists.items,
    (state: AppState) => state.performers.items,
    (id, movies, lists, performers) => {
      if (!id) {
        return false;
      }

      return (
        movies.some((m) => m[profileProp as keyof Movie] === id) ||
        lists.some((list) => list[profileProp as keyof ImportList] === id) ||
        performers.some(
          (performer) => performer[profileProp as keyof Performer] === id
        )
      );
    }
  );
}

export default createProfileInUseSelector;
