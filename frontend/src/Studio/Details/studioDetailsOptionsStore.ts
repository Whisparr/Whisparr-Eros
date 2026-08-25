import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';

export type StudioDetailsWorksView = 'table' | 'posters';

export interface StudioDetailsPosterOptions {
  info: string;
  size: string;
}

interface StudioDetailsOptions {
  view: StudioDetailsWorksView;
  posterOptions: StudioDetailsPosterOptions;
}

const { useOption, getOptions, setOption } =
  createOptionsStore<StudioDetailsOptions>('studio_details_options', () => ({
    view: 'table',
    posterOptions: {
      info: 'studio',
      size: 'large',
    },
  }));

export const useStudioDetailsOption = useOption;

export const setStudioDetailsView = (view: string) => {
  setOption('view', view === 'posters' ? 'posters' : 'table');
};

export const setStudioDetailsPosterOption = (
  payload: Partial<StudioDetailsPosterOptions>
) => {
  setOption('posterOptions', { ...getOptions().posterOptions, ...payload });
};
