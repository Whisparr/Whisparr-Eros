import { FilterBuilderProp, PropertyFilter } from 'Filters/Filter';
import { FilterType } from 'Helpers/Props/filterTypes';

export interface FilterBuilderRowOnChangeProps {
  name: string;
  // Whatever the filter holds: an array for every value type but date, which
  // holds either a `yyyy-mm-dd` string or an in-last/in-next `{ time, value }`.
  value: PropertyFilter['value'];
}

interface FilterBuilderRowValueProps {
  filterType?: FilterType;
  filterValue: PropertyFilter['value'];
  selectedFilterBuilderProp: FilterBuilderProp<unknown>;
  // Was `sectionItem`, which nothing read -- `DefaultFilterBuilderRowValue`,
  // the only component that wants the items, had to omit the typo and
  // redeclare the name the row actually passes.
  sectionItems: readonly unknown[];
  onChange: (payload: FilterBuilderRowOnChangeProps) => void;
}

export default FilterBuilderRowValueProps;
