import { useImportLists } from 'Settings/ImportLists/ImportLists/useImportLists';

// Replaces `createProfileInUseSelector('qualityProfileId')`, which only ever
// answered for quality profiles.
//
// The answer is incomplete: the server also refuses to delete a profile that a
// movie, performer or studio uses, or that is the fallback, and none of those
// are askable from the client without fetching the whole library.
// `GET /qualityprofile/{id}/inuse` is the shape that would close it (filed as
// Whisparr/Whisparr#1138); until then this only decides whether the modal warns
// before the server refuses.
function useQualityProfileInUse(id: number | undefined) {
  const { data } = useImportLists();

  if (!id) {
    return false;
  }

  return data.some((list) => list.qualityProfileId === id);
}

export default useQualityProfileInUse;
