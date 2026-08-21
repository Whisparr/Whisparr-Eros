import { FilterBuilderProp, FilterBuilderPropOption } from 'Filters/Filter';
import { filterBuilderTypes, filterBuilderValueTypes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import sortByProp from 'Utilities/Array/sortByProp';
import translate from 'Utilities/String/translate';

// Lifted verbatim out of `movieIndexActions.defaultState`. These are static
// definitions, not user state, so they do not belong in the options store --
// only the selected filter key does.
export const MOVIE_INDEX_FILTER_BUILDER_PROPS: FilterBuilderProp<Movie>[] = [
  {
    name: 'monitored',
    label: () => translate('Monitored'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.BOOL,
  },
  {
    name: 'isAvailable',
    label: () => translate('ConsideredAvailable'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.BOOL,
  },
  {
    name: 'title',
    label: () => translate('Title'),
    type: filterBuilderTypes.STRING,
  },
  {
    name: 'releaseGroups',
    label: () => translate('ReleaseGroups'),
    type: filterBuilderTypes.ARRAY,
    optionsSelector: function (items: Movie[]) {
      const groupList = items.reduce<FilterBuilderPropOption[]>(
        (acc, movie) => {
          const releaseGroups = movie.statistics?.releaseGroups ?? [];

          releaseGroups.forEach((releaseGroup) => {
            acc.push({
              id: releaseGroup,
              name: releaseGroup,
            });
          });

          return acc;
        },
        []
      );

      return groupList.sort(sortByProp('name'));
    },
  },
  {
    name: 'status',
    label: () => translate('ReleaseStatus'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.RELEASE_STATUS,
  },
  {
    name: 'studio',
    label: () => translate('Studio'),
    type: filterBuilderTypes.EXACT,
    optionsSelector: function (items: Movie[]) {
      const tagList = items.reduce<FilterBuilderPropOption[]>((acc, movie) => {
        if (movie.studioTitle) {
          acc.push({
            id: movie.studioTitle,
            name: movie.studioTitle,
          });
        }

        return acc;
      }, []);

      return tagList.sort(sortByProp('name'));
    },
  },
  {
    name: 'qualityProfileId',
    label: () => translate('QualityProfile'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.QUALITY_PROFILE,
  },
  {
    name: 'added',
    label: () => translate('Added'),
    type: filterBuilderTypes.DATE,
    valueType: filterBuilderValueTypes.DATE,
  },
  {
    name: 'year',
    label: () => translate('Year'),
    type: filterBuilderTypes.NUMBER,
  },
  {
    name: 'releaseDate',
    label: () => translate('ReleaseDate'),
    type: filterBuilderTypes.DATE,
    valueType: filterBuilderValueTypes.DATE,
  },
  {
    name: 'runtime',
    label: () => translate('Runtime'),
    type: filterBuilderTypes.NUMBER,
  },
  {
    name: 'path',
    label: () => translate('Path'),
    type: filterBuilderTypes.STRING,
  },
  {
    name: 'sizeOnDisk',
    label: () => translate('SizeOnDisk'),
    type: filterBuilderTypes.NUMBER,
    valueType: filterBuilderValueTypes.BYTES,
  },
  {
    name: 'genres',
    label: () => translate('Genres'),
    type: filterBuilderTypes.STRING,
  },
  {
    name: 'tags',
    label: () => translate('Tags'),
    type: filterBuilderTypes.ARRAY,
    valueType: filterBuilderValueTypes.TAG,
  },
];
