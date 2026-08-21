import { create } from 'zustand';

interface StudioDeleteOptions {
  addImportExclusion: boolean;
}

// Replaces `studios.deleteOptions`, shared by the per-studio delete modal and
// the index's bulk one. Deliberately not `createPersist`: unlike
// `movies.deleteOptions`, the studio slice never listed this in `persistState`,
// so it has always been session-only and stays that way.
const studioDeleteOptionsStore = create<StudioDeleteOptions>(() => ({
  addImportExclusion: false,
}));

export const useStudioDeleteOptions = () => studioDeleteOptionsStore();

export const setStudioDeleteOption = <K extends keyof StudioDeleteOptions>(
  name: K,
  value: StudioDeleteOptions[K]
) => {
  studioDeleteOptionsStore.setState({ [name]: value } as Pick<
    StudioDeleteOptions,
    K
  >);
};
