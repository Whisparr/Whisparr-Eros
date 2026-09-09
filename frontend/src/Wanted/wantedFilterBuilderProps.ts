import { FilterBuilderProp } from 'Filters/Filter';
import { filterBuilderTypes, filterBuilderValueTypes } from 'Helpers/Props';
import Movie from 'Movie/Movie';
import translate from 'Utilities/String/translate';

// Shared by both wanted pages. The names are the query parameters the V3
// wanted controllers bind, not Movie properties: filtering happens in SQL
// rather than client-side, so `movieTags` is the tag filter even though the
// property on Movie is `tags`.
const WANTED_FILTER_BUILDER_PROPS: FilterBuilderProp<Movie>[] = [
  {
    name: 'monitored',
    label: () => translate('Monitored'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.BOOL,
  },
  {
    name: 'movieIds',
    label: () => translate('Movies'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.MOVIE,
  },
  {
    name: 'qualityProfileIds',
    label: () => translate('QualityProfile'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.QUALITY_PROFILE,
  },
  {
    name: 'movieTags',
    label: () => translate('Tags'),
    type: filterBuilderTypes.ARRAY,
    valueType: filterBuilderValueTypes.TAG,
  },
];

export const MISSING_FILTER_BUILDER_PROPS = WANTED_FILTER_BUILDER_PROPS;

// Only the cutoff page filters by the quality already on disk; a missing movie
// has no file to match against.
export const CUTOFF_UNMET_FILTER_BUILDER_PROPS: FilterBuilderProp<Movie>[] = [
  ...WANTED_FILTER_BUILDER_PROPS,
  {
    name: 'quality',
    label: () => translate('Quality'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.QUALITY,
  },
];
