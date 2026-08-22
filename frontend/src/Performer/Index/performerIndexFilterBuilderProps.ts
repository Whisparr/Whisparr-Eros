import { FilterBuilderProp } from 'Filters/Filter';
import { filterBuilderTypes, filterBuilderValueTypes } from 'Helpers/Props';
import Performer from 'Performer/Performer';
import sortByProp from 'Utilities/Array/sortByProp';
import camelCaseToString from 'Utilities/String/camelCaseToString';
import translate from 'Utilities/String/translate';

// Every one of these lists is fixed rather than derived from the loaded
// performers, which is why the empty `sectionItems` the filter modal used to
// pass never showed: no row read it.
function fixedOptions(values: string[]) {
  return values
    .map((value) => ({ id: value, name: camelCaseToString(value) }))
    .sort(sortByProp('name'));
}

// Lifted verbatim out of `performerActions.defaultState`. Static definitions
// rather than user state, so they do not belong in the options store -- only
// the selected filter key does.
export const PERFORMER_INDEX_FILTER_BUILDER_PROPS: FilterBuilderProp<Performer>[] =
  [
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
      name: 'sceneCount',
      label: () => translate('SceneCount'),
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
      name: 'movieCount',
      label: () => translate('MovieCount'),
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
      name: 'sizeOnDisk',
      label: () => translate('SizeOnDisk'),
      type: filterBuilderTypes.NUMBER,
      valueType: filterBuilderValueTypes.DEFAULT,
    },
    {
      name: 'age',
      label: () => translate('Age'),
      type: filterBuilderTypes.NUMBER,
      valueType: filterBuilderValueTypes.DEFAULT,
    },
    {
      name: 'country',
      label: () => translate('Country'),
      type: filterBuilderTypes.STRING,
      valueType: filterBuilderValueTypes.DEFAULT,
    },
    {
      name: 'careerStart',
      label: () => translate('CareerStart'),
      type: filterBuilderTypes.NUMBER,
      valueType: filterBuilderValueTypes.DEFAULT,
    },
    {
      name: 'careerEnd',
      label: () => translate('CareerEnd'),
      type: filterBuilderTypes.NUMBER,
      valueType: filterBuilderValueTypes.DEFAULT,
    },
    {
      name: 'status',
      label: () => translate('Status'),
      type: filterBuilderTypes.EXACT,
      optionsSelector: () =>
        fixedOptions(['active', 'inactive', 'unknown', 'deleted']),
    },
    {
      name: 'rootFolderPath',
      label: () => translate('RootFolder'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.FOLDER,
    },
    {
      name: 'qualityProfileId',
      label: () => translate('QualityProfile'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.QUALITY_PROFILE,
    },
    {
      name: 'gender',
      label: () => translate('Gender'),
      type: filterBuilderTypes.EXACT,
      optionsSelector: () =>
        fixedOptions([
          'male',
          'female',
          'transMale',
          'transFemale',
          'nonBinary',
          'intersex',
        ]),
    },
    {
      name: 'hairColor',
      label: () => translate('HairColor'),
      type: filterBuilderTypes.EXACT,
      optionsSelector: () =>
        fixedOptions([
          'blonde',
          'black',
          'red',
          'auburn',
          'grey',
          'various',
          'bald',
          'other',
        ]),
    },
    {
      name: 'ethnicity',
      label: () => translate('Ethnicity'),
      type: filterBuilderTypes.EXACT,
      optionsSelector: () =>
        fixedOptions([
          'caucasian',
          'black',
          'asian',
          'latin',
          'indian',
          'middleEastern',
          'other',
        ]),
    },
    {
      name: 'tags',
      label: () => translate('Tags'),
      type: filterBuilderTypes.ARRAY,
      valueType: filterBuilderValueTypes.TAG,
    },
  ];
