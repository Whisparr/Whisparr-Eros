import { create } from 'zustand';

interface PerformerDeleteOptions {
  addImportExclusion: boolean;
}

// Replaces `performers.deleteOptions`. Only the per-performer delete modal reads
// it -- the index's bulk modal has always kept its own local state -- but the
// slice held it for the whole session, so the checkbox stays ticked between
// opens as it did. Deliberately not `createPersist`: the slice never listed this
// in `persistState`, so it has always been session-only and stays that way.
const performerDeleteOptionsStore = create<PerformerDeleteOptions>(() => ({
  addImportExclusion: false,
}));

export const usePerformerDeleteOptions = () => performerDeleteOptionsStore();

export const setPerformerDeleteOption = <
  K extends keyof PerformerDeleteOptions,
>(
  name: K,
  value: PerformerDeleteOptions[K]
) => {
  performerDeleteOptionsStore.setState({ [name]: value } as Pick<
    PerformerDeleteOptions,
    K
  >);
};
