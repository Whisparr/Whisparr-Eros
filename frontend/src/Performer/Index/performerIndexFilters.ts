import { Filter } from 'App/State/AppState';
import { filterTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

// The preset filters offered by the filter menu. Lifted out of
// `performerActions` unchanged: static definitions rather than user state, so
// they never belonged in slice state.
export const PERFORMER_INDEX_FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
  {
    key: 'monitoredscenesonly',
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
    key: 'monitoredmoviessonly',
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
];
