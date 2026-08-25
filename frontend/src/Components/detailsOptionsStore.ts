import { CommonPosterOptions } from 'Components/PosterOptionsForm';
import { createOptionsStore } from 'Helpers/Hooks/useOptionsStore';

export type DetailsWorksView = 'table' | 'posters';

interface DetailsOptions {
  view: DetailsWorksView;
  posterOptions: CommonPosterOptions;
}

const defaultPosterOptions: CommonPosterOptions = {
  detailedProgressBar: false,
  showMonitored: true,
  showQualityProfile: true,
  showReleaseDate: false,
  showSearchAction: false,
  showTitle: false,
  size: 'large',
};

function mergePosterOptions(
  persisted: Partial<CommonPosterOptions> | undefined
): CommonPosterOptions {
  return {
    detailedProgressBar:
      persisted?.detailedProgressBar ??
      defaultPosterOptions.detailedProgressBar,
    showMonitored:
      persisted?.showMonitored ?? defaultPosterOptions.showMonitored,
    showQualityProfile:
      persisted?.showQualityProfile ?? defaultPosterOptions.showQualityProfile,
    showReleaseDate:
      persisted?.showReleaseDate ?? defaultPosterOptions.showReleaseDate,
    showSearchAction:
      persisted?.showSearchAction ?? defaultPosterOptions.showSearchAction,
    showTitle: persisted?.showTitle ?? defaultPosterOptions.showTitle,
    size: persisted?.size ?? defaultPosterOptions.size,
  };
}

export function createDetailsOptionsStore(name: string) {
  const { useOption, getOptions, setOption } =
    createOptionsStore<DetailsOptions>(
      name,
      () => ({
        view: 'table',
        posterOptions: defaultPosterOptions,
      }),
      {
        merge: (persistedState, currentState) => {
          const persisted = (persistedState ?? {}) as Partial<DetailsOptions>;

          return {
            ...currentState,
            view: persisted.view === 'posters' ? 'posters' : 'table',
            posterOptions: mergePosterOptions(persisted.posterOptions),
          };
        },
      }
    );

  return {
    useOption,
    setView: (view: string) => {
      setOption('view', view === 'posters' ? 'posters' : 'table');
    },
    setPosterOption: (payload: Partial<CommonPosterOptions>) => {
      setOption('posterOptions', {
        ...getOptions().posterOptions,
        ...payload,
      });
    },
  };
}
