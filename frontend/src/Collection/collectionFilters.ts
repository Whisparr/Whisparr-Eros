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
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';
import MovieCollection from './MovieCollection';

// Lifted verbatim out of `movieCollectionActions.defaultState`. Static
// definitions rather than user state, so they do not belong in the options
// store -- only the selected filter key does.
export const COLLECTION_FILTERS: Filter[] = [
  {
    key: 'all',
    label: () => translate('All'),
    filters: [],
  },
  {
    key: 'missing',
    label: () => translate('Missing'),
    filters: [
      {
        key: 'missingMovies',
        value: 0,
        type: filterTypes.GREATER_THAN,
      },
    ],
  },
  {
    key: 'complete',
    label: () => translate('Complete'),
    filters: [
      {
        key: 'missingMovies',
        value: 0,
        type: filterTypes.EQUAL,
      },
    ],
  },
];

function collectionGenres(collection: MovieCollection) {
  return Array.from(new Set(collection.movies.flatMap(({ genres }) => genres)));
}

export type CollectionFilterPredicate = (
  item: MovieCollection,
  filterValue: unknown,
  type: FilterType
) => boolean;

export const COLLECTION_FILTER_PREDICATES: Record<
  string,
  CollectionFilterPredicate
> = {
  genres: (item, filterValue, type) =>
    filterTypePredicates[type](collectionGenres(item), filterValue),
  totalMovies: (item, filterValue, type) =>
    filterTypePredicates[type](item.movies.length, filterValue),
};

export const COLLECTION_FILTER_BUILDER_PROPS: FilterBuilderProp<MovieCollection>[] =
  [
    {
      name: 'title',
      label: () => translate('Title'),
      type: filterBuilderTypes.STRING,
    },
    {
      name: 'monitored',
      label: () => translate('Monitored'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL,
    },
    {
      name: 'qualityProfileId',
      label: () => translate('QualityProfile'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.QUALITY_PROFILE,
    },
    {
      name: 'rootFolderPath',
      label: () => translate('RootFolder'),
      type: filterBuilderTypes.STRING,
    },
    {
      name: 'genres',
      label: () => translate('Genres'),
      type: filterBuilderTypes.ARRAY,
      optionsSelector: (items) => {
        const genreList = items.reduce(
          (acc: FilterBuilderPropOption[], collection) => {
            collectionGenres(collection).forEach((genre) => {
              acc.push({ id: genre, name: genre });
            });

            return acc;
          },
          []
        );

        return genreList.sort(sortByProp('name'));
      },
    },
    {
      name: 'totalMovies',
      label: () => translate('TotalMovies'),
      type: filterBuilderTypes.NUMBER,
    },
  ];
