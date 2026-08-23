import { createPersist } from 'Helpers/createPersist';

export interface AddStudioDefaults {
  rootFolderPath: string;
  monitored: boolean;
  moviesMonitored: boolean;
  qualityProfileId: number;
  searchForMovie: boolean;
  tags: number[];
}

// Replaces `persistState: ['addMovie.studioDefaults']`. The add modal is opened
// once per search result and seeds itself from these, so what you chose for the
// last studio you added is what the next one starts with.
const addStudioDefaultsStore = createPersist<AddStudioDefaults>(
  'add_studio_defaults',
  () => ({
    rootFolderPath: '',
    monitored: true,
    moviesMonitored: false,
    qualityProfileId: 0,
    searchForMovie: false,
    tags: [],
  })
);

export const useAddStudioDefaults = () => addStudioDefaultsStore();

export const setAddStudioDefault = <K extends keyof AddStudioDefaults>(
  name: K,
  value: AddStudioDefaults[K]
) => {
  addStudioDefaultsStore.setState({ [name]: value } as Pick<
    AddStudioDefaults,
    K
  >);
};
