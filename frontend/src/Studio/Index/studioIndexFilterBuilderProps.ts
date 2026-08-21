import { uniqBy } from 'lodash';
import { FilterBuilderProp, FilterBuilderPropOption } from 'Filters/Filter';
import { filterBuilderTypes, filterBuilderValueTypes } from 'Helpers/Props';
import Studio from 'Studio/Studio';
import sortByProp from 'Utilities/Array/sortByProp';
import camelCaseToString from 'Utilities/String/camelCaseToString';
import translate from 'Utilities/String/translate';

// Lifted verbatim out of `studioActions.defaultState`. Static definitions rather
// than user state, so they do not belong in the options store -- only the
// selected filter key does.
export const STUDIO_INDEX_FILTER_BUILDER_PROPS: FilterBuilderProp<Studio>[] = [
  {
    name: 'monitored',
    label: () => translate('MonitoredScene'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.BOOL,
  },
  {
    name: 'moviesMonitored',
    label: () => translate('MonitoredMovie'),
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
    name: 'title',
    label: () => translate('Title'),
    type: filterBuilderTypes.EXACT,
    valueType: filterBuilderValueTypes.DEFAULT,
  },
  {
    name: 'status',
    label: () => translate('Status'),
    type: filterBuilderTypes.EXACT,
    optionsSelector: function () {
      const tagList = ['active', 'deleted'];

      const tags = tagList.map((tag) => {
        return {
          id: tag,
          name: camelCaseToString(tag),
        };
      });

      return tags.sort(sortByProp('name'));
    },
  },
  {
    name: 'sceneCount',
    label: () => translate('SceneCount'),
    type: filterBuilderTypes.NUMBER,
    valueType: filterBuilderValueTypes.DEFAULT,
  },
  {
    name: 'totalSceneCount',
    label: () => translate('TotalSceneCount'),
    type: filterBuilderTypes.NUMBER,
    valueType: filterBuilderValueTypes.DEFAULT,
  },
  {
    name: 'movieCount',
    label: () => translate('MovieCount'),
    type: filterBuilderTypes.NUMBER,
    valueType: filterBuilderValueTypes.DEFAULT,
  },
  {
    name: 'totalMovieCount',
    label: () => translate('TotalMovieCount'),
    type: filterBuilderTypes.NUMBER,
    valueType: filterBuilderValueTypes.DEFAULT,
  },
  {
    name: 'sizeOnDisk',
    label: () => translate('SizeOnDisk'),
    type: filterBuilderTypes.NUMBER,
    valueType: filterBuilderValueTypes.DEFAULT,
  },
  {
    name: 'network',
    label: () => translate('Network'),
    type: filterBuilderTypes.EXACT,
    optionsSelector: function (items: Studio[]) {
      const tagList = items.reduce<FilterBuilderPropOption[]>((acc, studio) => {
        if (studio?.network) {
          acc.push({
            id: studio.network,
            name: studio.network,
          });
        }

        return acc;
      }, []);

      return uniqBy(tagList, 'id').sort(sortByProp('name'));
    },
  },
  {
    name: 'tags',
    label: () => translate('Tags'),
    type: filterBuilderTypes.ARRAY,
    valueType: filterBuilderValueTypes.TAG,
  },
];
