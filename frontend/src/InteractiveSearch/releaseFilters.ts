import {
  Filter,
  FilterBuilderProp,
  FilterBuilderPropOption,
} from 'Filters/Filter';
import {
  filterBuilderTypes,
  filterBuilderValueTypes,
  filterTypePredicates,
  filterTypes,
} from 'Helpers/Props';
import { FilterType } from 'Helpers/Props/filterTypes';
import Release from 'typings/Release';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';

// Lifted verbatim out of `releaseActions.defaultState`. Static definitions
// rather than user state, so only the selected key belongs in the store.
export const RELEASE_FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
];

export type ReleaseFilterPredicate = (
  item: Release,
  filterValue: unknown,
  type: FilterType
) => boolean;

const predicates = filterTypePredicates as Record<
  string,
  (itemValue: unknown, filterValue: unknown) => boolean
>;

// Only the four fields that are not plain properties of the release need one --
// `clientSideFilterAndSort` falls back to the property of the same name for the
// rest, which covers every other row in `RELEASE_FILTER_BUILDER_PROPS`.
export const RELEASE_FILTER_PREDICATES: Record<string, ReleaseFilterPredicate> =
  {
    quality: (item, filterValue, type) => {
      const qualityId = item.quality.quality.id;

      if (type === filterTypes.EQUAL) {
        return qualityId === filterValue;
      }

      if (type === filterTypes.NOT_EQUAL) {
        return qualityId !== filterValue;
      }

      return false;
    },

    languages: (item, filterValue, type) =>
      predicates[type](
        item.languages.map((language) => language.name),
        filterValue
      ),

    peers: (item, filterValue, type) =>
      predicates[type]((item.seeders || 0) + (item.leechers || 0), filterValue),

    rejectionCount: (item, filterValue, type) =>
      predicates[type](item.rejections.length, filterValue),
  };

export const RELEASE_FILTER_BUILDER_PROPS: FilterBuilderProp<Release>[] = [
  {
    name: 'title',
    label: () => translate('Title'),
    type: filterBuilderTypes.STRING,
  },
  {
    name: 'age',
    label: () => translate('Age'),
    type: filterBuilderTypes.NUMBER,
  },
  {
    name: 'protocol',
    label: () => translate('Protocol'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.PROTOCOL,
  },
  {
    name: 'indexerId',
    label: () => translate('Indexer'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.INDEXER,
  },
  {
    name: 'size',
    label: () => translate('Size'),
    type: filterBuilderTypes.NUMBER,
    valueType: filterBuilderValueTypes.BYTES,
  },
  {
    name: 'seeders',
    label: () => translate('Seeders'),
    type: filterBuilderTypes.NUMBER,
  },
  {
    name: 'peers',
    label: () => translate('Peers'),
    type: filterBuilderTypes.NUMBER,
  },
  {
    name: 'quality',
    label: () => translate('Quality'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.QUALITY,
  },
  {
    name: 'languages',
    label: () => translate('Languages'),
    type: filterBuilderTypes.ARRAY,
    optionsSelector: (items) => {
      const languageList = items.reduce(
        (acc: FilterBuilderPropOption[], release) => {
          release.languages.forEach((language) => {
            acc.push({ id: language.name, name: language.name });
          });

          return acc;
        },
        []
      );

      return languageList.sort(sortByProp('name'));
    },
  },
  {
    name: 'customFormatScore',
    label: () => translate('CustomFormatScore'),
    type: filterBuilderTypes.NUMBER,
  },
  {
    name: 'rejectionCount',
    label: () => translate('RejectionCount'),
    type: filterBuilderTypes.NUMBER,
  },
  {
    name: 'movieRequested',
    label: () => translate('MovieRequested'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.BOOL,
  },
];
