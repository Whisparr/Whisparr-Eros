import { createPersist } from 'Helpers/createPersist';

export interface AddPerformerDefaults {
  rootFolderPath: string;
  monitored: boolean;
  moviesMonitored: boolean;
  qualityProfileId: number;
  searchForMovie: boolean;
  tags: number[];
}

// Replaces `persistState: ['addPerformer.performerDefaults']`. The add modal is
// opened once per search result and seeds itself from these, so what you chose
// for the last performer you added is what the next one starts with.
const addPerformerDefaultsStore = createPersist<AddPerformerDefaults>(
  'add_performer_defaults',
  () => ({
    rootFolderPath: '',
    monitored: true,
    moviesMonitored: false,
    qualityProfileId: 0,
    searchForMovie: false,
    tags: [],
  })
);

export const useAddPerformerDefaults = () => addPerformerDefaultsStore();

export const setAddPerformerDefault = <K extends keyof AddPerformerDefaults>(
  name: K,
  value: AddPerformerDefaults[K]
) => {
  addPerformerDefaultsStore.setState({ [name]: value } as Pick<
    AddPerformerDefaults,
    K
  >);
};
