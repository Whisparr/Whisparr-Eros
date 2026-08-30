import { create } from 'zustand';

interface CollectionDeleteOptions {
  addImportExclusion: boolean;
}

// Replaces `movieCollections.deleteOptions`. Deliberately not `createPersist`:
// the slice never listed this in `persistState`, so it has always been
// session-only and stays that way.
const collectionDeleteOptionsStore = create<CollectionDeleteOptions>(() => ({
  addImportExclusion: false,
}));

export const useCollectionDeleteOption = <
  K extends keyof CollectionDeleteOptions,
>(
  key: K
) => collectionDeleteOptionsStore((state) => state[key]);

export function setCollectionDeleteOption(
  option: Partial<CollectionDeleteOptions>
) {
  collectionDeleteOptionsStore.setState(option);
}
