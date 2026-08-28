import ModelBase from 'App/ModelBase';
import { FilterBuilderTypes } from 'Helpers/Props/filterBuilderTypes';
import { FilterBuilderValueType } from 'Helpers/Props/filterBuilderValueTypes';
import { DateFilterValue, FilterType } from 'Helpers/Props/filterTypes';

export interface FilterBuilderPropOption {
  id: string;
  name: string;
}

export interface FilterBuilderProp<T> {
  name: string;
  label: string | (() => string);
  type: FilterBuilderTypes;
  valueType?: FilterBuilderValueType;
  optionsSelector?: (items: T[]) => FilterBuilderPropOption[];
}

export interface PropertyFilter {
  key: string;
  // Preset filters carry scalar numbers and booleans -- the collection page's
  // `missingMovies` presets are `0`, the index's `monitored` presets are
  // `true`/`false`. Custom filters from the API add the array and date forms.
  // `App/State/AppState`'s copy of this type already allowed both; this one had
  // drifted.
  value:
    | boolean
    | string
    | number
    | string[]
    | number[]
    | boolean[]
    | DateFilterValue;
  type: FilterType;
}

export interface Filter {
  key: string | number;
  label: string | (() => string);
  filters: PropertyFilter[];
}

export interface CustomFilter extends ModelBase {
  type: string;
  label: string;
  filters: PropertyFilter[];
}
