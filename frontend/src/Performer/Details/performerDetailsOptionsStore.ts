import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';

export type PerformerDetailsWorksView = 'table' | 'posters';

export interface PerformerDetailsPosterOptions {
  info: string;
  size: string;
}

interface PerformerDetailsOptions {
  view: PerformerDetailsWorksView;
  posterOptions: PerformerDetailsPosterOptions;
}

const { useOption, getOptions, setOption } =
  createOptionsStore<PerformerDetailsOptions>(
    'performer_details_options',
    () => ({
      view: 'table',
      posterOptions: {
        info: 'studio',
        size: 'large',
      },
    })
  );

export const usePerformerDetailsOption = useOption;

export const setPerformerDetailsView = (view: string) => {
  setOption('view', view === 'posters' ? 'posters' : 'table');
};

export const setPerformerDetailsPosterOption = (
  payload: Partial<PerformerDetailsPosterOptions>
) => {
  setOption('posterOptions', { ...getOptions().posterOptions, ...payload });
};
