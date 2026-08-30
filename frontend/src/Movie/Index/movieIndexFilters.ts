import { Filter } from 'Filters/Filter';
import { filterTypes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

// The preset filters offered by the filter menu. Lifted out of `movieActions`
// unchanged: they are static definitions rather than user state, so they never
// belonged in slice state. Scene shares them -- both indexes filter the same
// `/movie` resource. Named export only, so `filenames/match-exported` is happy.
export const MOVIE_INDEX_FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
  {
    key: 'monitored',
    label: () => translate('MonitoredOnly'),
    filters: [
      {
        key: 'monitored',
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
    key: 'missing',
    label: () => translate('Missing'),
    filters: [
      {
        key: 'monitored',
        value: true,
        type: filterTypes.EQUAL,
      },
      {
        key: 'sizeOnDisk',
        value: 0,
        type: filterTypes.EQUAL,
      },
    ],
  },
  {
    key: 'wanted',
    label: () => translate('Wanted'),
    filters: [
      {
        key: 'monitored',
        value: true,
        type: filterTypes.EQUAL,
      },
      {
        key: 'sizeOnDisk',
        value: 0,
        type: filterTypes.GREATER_THAN,
      },
      {
        key: 'isAvailable',
        value: true,
        type: filterTypes.EQUAL,
      },
    ],
  },

  /* removing, duplicated by Wanted > Cutoff Unmet page
  {
    key: 'cutoffunmet',
    label: () => translate('CutoffUnmet'),
    filters: [
      {
        key: 'monitored',
        value: true,
        type: filterTypes.EQUAL
      },
      {
        key: 'sizeOnDisk',
        value: 0,
        type: filterTypes.GREATER_THAN
      },
      {
        key: 'qualityCutoffNotMet',
        value: true,
        type: filterTypes.EQUAL
      }
    ]
  }*/
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
