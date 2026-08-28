import React, { useCallback, useMemo } from 'react';
import TagInput, { TagBase } from 'Components/Form/Tag/TagInput';
import { DeletedTag } from 'Components/Form/Tag/TagInputTag';
import { FilterBuilderProp, PropertyFilter } from 'Filters/Filter';
import {
  filterBuilderTypes,
  filterBuilderValueTypes,
  kinds,
} from 'Helpers/Props';
import convertToBytes from 'Utilities/Number/convertToBytes';
import formatBytes from 'Utilities/Number/formatBytes';
import FilterBuilderRowValueProps from './FilterBuilderRowValueProps';
import FilterBuilderRowValueTag from './FilterBuilderRowValueTag';

export const NAME = 'value';

// What a filter row holds one of. `id` is nullable because `TagInput` builds a
// tag the user typed as a bare `{ name }`, which is what the `??` below is for.
export interface FilterTag extends TagBase {
  id: boolean | string | number | null;
  name: string | number;
}

// The section's items are not among them: this component takes the finished
// tag list, and every wrapper that builds one out of the items keeps them.
export interface FilterBuilderRowValueComponentProps extends Omit<
  FilterBuilderRowValueProps,
  'sectionItems'
> {
  tagList: FilterTag[];
}

const BYTES_PATTERN = /^(\d+)([kmgt](i?b)?)$/i;

function getTagDisplayValue(
  value: FilterTag['id'],
  selectedFilterBuilderProp: FilterBuilderProp<unknown>
): FilterTag['name'] {
  if (selectedFilterBuilderProp.valueType === filterBuilderValueTypes.BYTES) {
    // `formatBytes` coerces with `Number` itself, so this is the same call the
    // untyped version made.
    return formatBytes(Number(value));
  }

  // Only a bool filter holds a boolean, and a bool filter always has a tag
  // list -- its values are named from that list, never displayed raw here.
  return value as FilterTag['name'];
}

function getValue(
  input: string,
  selectedFilterBuilderProp: FilterBuilderProp<unknown>
) {
  if (selectedFilterBuilderProp.valueType === filterBuilderValueTypes.BYTES) {
    const match = input.match(BYTES_PATTERN);

    if (match && match.length > 1) {
      const [, value, unit] = match;

      switch (unit.toLowerCase()) {
        case 'k':
          return convertToBytes(value, 1, true);
        case 'm':
          return convertToBytes(value, 2, true);
        case 'g':
          return convertToBytes(value, 3, true);
        case 't':
          return convertToBytes(value, 4, true);
        case 'kb':
          return convertToBytes(value, 1, true);
        case 'mb':
          return convertToBytes(value, 2, true);
        case 'gb':
          return convertToBytes(value, 3, true);
        case 'tb':
          return convertToBytes(value, 4, true);
        case 'kib':
          return convertToBytes(value, 1, true);
        case 'mib':
          return convertToBytes(value, 2, true);
        case 'gib':
          return convertToBytes(value, 3, true);
        case 'tib':
          return convertToBytes(value, 4, true);
        default:
          return Number.parseInt(value, 10);
      }
    }
  }

  if (selectedFilterBuilderProp.type === filterBuilderTypes.NUMBER) {
    const { numberFractionDigits = 0 } = selectedFilterBuilderProp;

    return Number(Number(input).toFixed(numberFractionDigits));
  }

  return input;
}

function FilterBuilderRowValue({
  filterValue,
  selectedFilterBuilderProp,
  tagList,
  onChange,
}: Readonly<FilterBuilderRowValueComponentProps>) {
  // Every value type but date holds an array, and date routes to
  // `DateFilterBuilderRowValue` instead: no filter declares one of
  // `type: DATE` / `valueType: DATE` without the other.
  const values = filterValue as FilterTag['id'][];

  const handleTagAdd = useCallback(
    (tag: FilterTag) => {
      const value =
        tag.id ?? getValue(String(tag.name), selectedFilterBuilderProp);

      onChange({
        name: NAME,
        // A filter's value is typed as an array of one scalar type, which is
        // what the API stores; the row builds it a tag at a time.
        value: [...values, value] as PropertyFilter['value'],
      });
    },
    [values, selectedFilterBuilderProp, onChange]
  );

  const handleTagDelete = useCallback(
    ({ index }: DeletedTag<FilterTag>) => {
      onChange({
        name: NAME,
        value: values.filter((_v, i) => i !== index) as PropertyFilter['value'],
      });
    },
    [values, onChange]
  );

  const tags = useMemo(() => {
    const hasItems = !!tagList.length;

    return values.map((id) => {
      if (hasItems) {
        const tag = tagList.find((t) => t.id === id);

        // `find` misses when a saved filter names something that has since
        // been deleted, and the row then shows the tag as "undefined". Left as
        // it is: coalescing changes what a stale filter displays.
        return { id, name: tag?.name as FilterTag['name'] };
      }

      return { id, name: getTagDisplayValue(id, selectedFilterBuilderProp) };
    });
  }, [values, tagList, selectedFilterBuilderProp]);

  return (
    <TagInput
      name={NAME}
      tags={tags}
      tagList={tagList}
      allowNew={!tagList.length}
      kind={kinds.DEFAULT}
      delimiters={['Tab', 'Enter']}
      minQueryLength={0}
      tagComponent={FilterBuilderRowValueTag}
      onTagAdd={handleTagAdd}
      onTagDelete={handleTagDelete}
    />
  );
}

export default FilterBuilderRowValue;
