import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import ImportList from 'typings/ImportList';

// Only import lists are checked. This also asked the `movies` slice whether any
// movie used the profile, but nothing has populated that slice since the indexes
// went paged, so the movie half has contributed nothing for some time and the
// term is dropped rather than left reading a slice that no longer exists.
// Answering it properly needs a server-side "is this profile in use" question,
// which belongs with the quality-profile settings conversion.
function createProfileInUseSelector(profileProp: string) {
  return createSelector(
    (_: AppState, { id }: { id: number }) => id,
    (state: AppState) => state.settings.importLists.items,
    (id, lists) => {
      if (!id) {
        return false;
      }

      return lists.some((list) => list[profileProp as keyof ImportList] === id);
    }
  );
}

export default createProfileInUseSelector;
