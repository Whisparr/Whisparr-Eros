import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import Movie from 'Movie/Movie';
import ImportList from 'typings/ImportList';
import createAllItemsSelector from './createAllItemsSelector';

function createProfileInUseSelector(profileProp: string) {
  return createSelector(
    (_: AppState, { id }: { id: number }) => id,
    createAllItemsSelector(),
    (state: AppState) => state.settings.importLists.items,
    (id, movies, lists) => {
      if (!id) {
        return false;
      }

      return (
        movies.some((m) => m[profileProp as keyof Movie] === id) ||
        lists.some((list) => list[profileProp as keyof ImportList] === id)
      );
    }
  );
}

export default createProfileInUseSelector;
