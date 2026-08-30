import { Filter } from 'Filters/Filter';
import { filterTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

// The preset filters offered by the filter menu. Lifted out of `studioActions`
// unchanged: they are static definitions rather than user state, so they never
// belonged in slice state.
export const STUDIO_INDEX_FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
  {
    key: 'monitoredscenes',
    label: () => translate('MonitoredScenesOnly'),
    filters: [
      {
        key: 'monitored',
        value: true,
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'monitoredMovies',
    label: () => translate('MonitoredMoviesOnly'),
    filters: [
      {
        key: 'moviesMonitored',
        value: true,
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'unmonitored',
    label: () => translate('Unmonitored'),
    filters: [
      {
        key: 'monitored',
        value: false,
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'deleted',
    label: () => translate('Deleted'),
    filters: [
      {
        key: 'status',
        value: 'deleted',
        type: filterTypes.EQUAL,
      },
    ],
  },
];
