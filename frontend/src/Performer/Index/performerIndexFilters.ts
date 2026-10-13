import { Filter, PropertyFilter } from 'Filters/Filter';
import { filterTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

// The preset filters offered by the filter menu. Lifted out of
// `performerActions` unchanged: static definitions rather than user state, so
// they never belonged in slice state.
//
// Every preset but Hidden leaves out the performers that were only added
// alongside a monitored one, so they don't crowd the index.
const VISIBLE_FILTER: PropertyFilter = {
  key: 'visibility',
  value: ['visible'],
  type: filterTypes.EQUAL,
};

export const PERFORMER_INDEX_FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [VISIBLE_FILTER],
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
      VISIBLE_FILTER,
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
      VISIBLE_FILTER,
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
      VISIBLE_FILTER,
    ],
  },
  {
    key: 'hidden',
    label: () => translate('Hidden'),
    filters: [
      {
        key: 'visibility',
        value: ['hidden'],
        type: filterTypes.EQUAL,
      },
    ],
  },
];
