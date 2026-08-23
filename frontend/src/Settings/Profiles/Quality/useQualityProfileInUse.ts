import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';

// Replaces `createProfileInUseSelector('qualityProfileId')`, which only ever
// answered for quality profiles. Import lists are still a Redux slice --
// they convert in section 9 -- so the read stays on `useSelector` for now.
//
// The answer is incomplete either way: the server also refuses to delete a
// profile that a movie, performer or studio uses, or that is the fallback, and
// none of those are askable from the client without fetching the whole library.
// `GET /qualityprofile/{id}/inuse` is the shape that would close it; until then
// this only decides whether the modal warns before the server refuses.
function useQualityProfileInUse(id: number | undefined) {
  return useSelector((state: AppState) => {
    if (!id) {
      return false;
    }

    return state.settings.importLists.items.some(
      (list) => list.qualityProfileId === id
    );
  });
}

export default useQualityProfileInUse;
