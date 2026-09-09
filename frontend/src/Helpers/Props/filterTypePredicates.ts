import { all, FilterType } from './filterTypes';
import getFilterTypePredicate from './getFilterTypePredicate';

// The same lookup `clientSideFilterAndSort` builds one entry at a time, kept in
// the map shape this module has always exported. The bodies used to be a second
// copy of `getFilterTypePredicate`'s, written before it existed and without its
// type guards -- the string comparisons called `String.prototype.contains`,
// which is not a standard method and only resolves because `polyfills.js`
// defines it.
const filterTypePredicates = Object.fromEntries(
  (all as FilterType[]).map(
    (filterType) => [filterType, getFilterTypePredicate(filterType)] as const
  )
) as Record<FilterType, (itemValue: unknown, filterValue: unknown) => boolean>;

export default filterTypePredicates;
