import { FilterBuilderProp } from 'Filters/Filter';
import { filterBuilderTypes, filterBuilderValueTypes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import translate from 'Utilities/String/translate';

// Lifted verbatim out of `sceneIndexActions.defaultState`. Static definitions
// rather than user state, so they do not belong in the options store -- only
// the selected filter key does. Scene's list is not Movie's: it has no
// release-group or studio rows and offers `genres` as a plain string match.
export const SCENE_INDEX_FILTER_BUILDER_PROPS: FilterBuilderProp<Movie>[] = [
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
    name: 'genres',
    label: () => translate('Genres'),
    type: filterBuilderTypes.STRING,
  },
  {
    name: 'status',
    label: () => translate('ReleaseStatus'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.RELEASE_STATUS,
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
    name: 'tags',
    label: () => translate('Tags'),
    type: filterBuilderTypes.ARRAY,
    valueType: filterBuilderValueTypes.TAG,
  },
];
