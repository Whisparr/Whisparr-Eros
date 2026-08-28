import React, { ComponentType, useCallback, useEffect, useMemo } from 'react';
import SelectInput from 'Components/Form/SelectInput';
import IconButton from 'Components/Link/IconButton';
import { FilterBuilderProp, PropertyFilter } from 'Filters/Filter';
import {
  filterBuilderTypes,
  filterBuilderValueTypes,
  icons,
} from 'Helpers/Props';
import { FilterType } from 'Helpers/Props/filterTypes';
import sortByProp from 'Utilities/Array/sortByProp';
import BoolFilterBuilderRowValue from './BoolFilterBuilderRowValue';
import DateFilterBuilderRowValue from './DateFilterBuilderRowValue';
import DefaultFilterBuilderRowValue from './DefaultFilterBuilderRowValue';
import FilterBuilderRowValueProps, {
  FilterBuilderRowOnChangeProps,
} from './FilterBuilderRowValueProps';
import HistoryEventTypeFilterBuilderRowValue from './HistoryEventTypeFilterBuilderRowValue';
import ImportListFilterBuilderRowValue from './ImportListFilterBuilderRowValue';
import IndexerFilterBuilderRowValue from './IndexerFilterBuilderRowValue';
import LanguageFilterBuilderRowValue from './LanguageFilterBuilderRowValue';
import MovieFilterBuilderRowValue from './MovieFilterBuilderRowValue';
import ProtocolFilterBuilderRowValue from './ProtocolFilterBuilderRowValue';
import QualityFilterBuilderRowValue from './QualityFilterBuilderRowValue';
import QualityProfileFilterBuilderRowValue from './QualityProfileFilterBuilderRowValue';
import QueueStatusFilterBuilderRowValue from './QueueStatusFilterBuilderRowValue';
import ReleaseStatusFilterBuilderRowValue from './ReleaseStatusFilterBuilderRowValue';
import TagFilterBuilderRowValue from './TagFilterBuilderRowValue';
import styles from './FilterBuilderRow.css';

interface FilterBuilderRowProps<T> {
  index: number;
  filterKey: PropertyFilter['key'];
  filterValue: PropertyFilter['value'];
  filterType: FilterType;
  filterCount: number;
  filterBuilderProps: FilterBuilderProp<T>[];
  sectionItems: readonly T[];
  onFilterChange: (index: number, filter: PropertyFilter) => void;
  onAddPress: (index: number) => void;
  onRemovePress: (index: number) => void;
}

function getFilterTypeOptions<T>(
  filterBuilderProps: FilterBuilderProp<T>[],
  filterKey: string
) {
  const selectedFilterBuilderProp = filterBuilderProps.find(
    (a) => a.name === filterKey
  );

  if (!selectedFilterBuilderProp) {
    return [];
  }

  return filterBuilderTypes.possibleFilterTypes[selectedFilterBuilderProp.type];
}

function getDefaultFilterType<T>(
  selectedFilterBuilderProp: FilterBuilderProp<T>
) {
  return filterBuilderTypes.possibleFilterTypes[
    selectedFilterBuilderProp.type
  ][0].key;
}

function getDefaultFilterValue<T>(
  selectedFilterBuilderProp: FilterBuilderProp<T>
): PropertyFilter['value'] {
  if (selectedFilterBuilderProp.type === filterBuilderTypes.DATE) {
    return '';
  }

  return [];
}

function getRowValueComponent<T>(
  selectedFilterBuilderProp?: FilterBuilderProp<T>
): ComponentType<FilterBuilderRowValueProps> {
  if (!selectedFilterBuilderProp) {
    return DefaultFilterBuilderRowValue;
  }

  const valueType = selectedFilterBuilderProp.valueType;

  switch (valueType) {
    case filterBuilderValueTypes.BOOL:
      return BoolFilterBuilderRowValue;

    case filterBuilderValueTypes.DATE:
      return DateFilterBuilderRowValue;

    case filterBuilderValueTypes.HISTORY_EVENT_TYPE:
      return HistoryEventTypeFilterBuilderRowValue;

    case filterBuilderValueTypes.INDEXER:
      return IndexerFilterBuilderRowValue;

    case filterBuilderValueTypes.LANGUAGE:
      return LanguageFilterBuilderRowValue;

    case filterBuilderValueTypes.PROTOCOL:
      return ProtocolFilterBuilderRowValue;

    case filterBuilderValueTypes.QUALITY:
      return QualityFilterBuilderRowValue;

    case filterBuilderValueTypes.QUALITY_PROFILE:
      return QualityProfileFilterBuilderRowValue;

    case filterBuilderValueTypes.QUEUE_STATUS:
      return QueueStatusFilterBuilderRowValue;

    case filterBuilderValueTypes.MOVIE:
      return MovieFilterBuilderRowValue;

    case filterBuilderValueTypes.RELEASE_STATUS:
      return ReleaseStatusFilterBuilderRowValue;

    case filterBuilderValueTypes.TAG:
      return TagFilterBuilderRowValue;

    case filterBuilderValueTypes.IMPORTLIST:
      return ImportListFilterBuilderRowValue;

    default:
      return DefaultFilterBuilderRowValue;
  }
}

function FilterBuilderRow<T>({
  index,
  filterKey,
  filterValue,
  filterType,
  filterCount,
  filterBuilderProps,
  sectionItems,
  onFilterChange,
  onAddPress,
  onRemovePress,
}: Readonly<FilterBuilderRowProps<T>>) {
  // The class kept this on the instance and reassigned it alongside every
  // `onFilterChange`; it was only ever the prop the key names.
  const selectedFilterBuilderProp = useMemo(
    () => filterBuilderProps.find((a) => a.name === filterKey),
    [filterBuilderProps, filterKey]
  );

  // A row rendered without a key is the empty one the modal seeds itself with,
  // and it picks up the first available filter. The parent re-keys the row on
  // the value that comes back, so this runs once per row either way.
  useEffect(() => {
    if (filterKey) {
      return;
    }

    const firstFilterBuilderProp = filterBuilderProps[0];

    onFilterChange(index, {
      key: firstFilterBuilderProp.name,
      value: getDefaultFilterValue(firstFilterBuilderProp),
      type: getDefaultFilterType(firstFilterBuilderProp),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterKeyChange = useCallback(
    ({ value: key }: { value: string }) => {
      const newFilterBuilderProp = filterBuilderProps.find(
        (a) => a.name === key
      );

      if (!newFilterBuilderProp) {
        return;
      }

      onFilterChange(index, {
        key,
        value: getDefaultFilterValue(newFilterBuilderProp),
        type: getDefaultFilterType(newFilterBuilderProp),
      });
    },
    [index, filterBuilderProps, onFilterChange]
  );

  const handleFilterChange = useCallback(
    ({ name, value }: FilterBuilderRowOnChangeProps) => {
      const filter: PropertyFilter = {
        key: filterKey,
        value: filterValue,
        type: filterType,
      };

      // The type select and the value components are the only two callers, and
      // they name the field they own -- the class assigned `filter[name]`.
      if (name === 'type') {
        filter.type = value as FilterType;
      } else {
        filter.value = value;
      }

      onFilterChange(index, filter);
    },
    [index, filterKey, filterValue, filterType, onFilterChange]
  );

  const handleAddPress = useCallback(() => {
    onAddPress(index);
  }, [index, onAddPress]);

  const handleRemovePress = useCallback(() => {
    onRemovePress(index);
  }, [index, onRemovePress]);

  const keyOptions = useMemo(() => {
    return filterBuilderProps
      .map(({ name, label }) => {
        return {
          key: name,
          value: typeof label === 'function' ? label() : label,
        };
      })
      .sort(sortByProp('value'));
  }, [filterBuilderProps]);

  const ValueComponent = getRowValueComponent(selectedFilterBuilderProp);

  return (
    <div className={styles.filterRow}>
      <div className={styles.inputContainer}>
        {filterKey && (
          <SelectInput
            name="key"
            value={filterKey}
            values={keyOptions}
            onChange={handleFilterKeyChange}
          />
        )}
      </div>

      <div className={styles.inputContainer}>
        {filterType && (
          <SelectInput
            name="type"
            value={filterType}
            values={getFilterTypeOptions(filterBuilderProps, filterKey)}
            onChange={handleFilterChange}
          />
        )}
      </div>

      <div className={styles.valueInputContainer}>
        {filterValue != null && !!selectedFilterBuilderProp && (
          // Every section shares one set of value components, so this is where
          // the row's item type stops: they take the items and the selected
          // prop as `unknown` and hand them straight back to the section's own
          // `optionsSelector`.
          <ValueComponent
            filterType={filterType}
            filterValue={filterValue}
            selectedFilterBuilderProp={
              selectedFilterBuilderProp as FilterBuilderProp<unknown>
            }
            sectionItems={sectionItems}
            onChange={handleFilterChange}
          />
        )}
      </div>

      <div className={styles.actionsContainer}>
        <IconButton
          name={icons.SUBTRACT}
          isDisabled={filterCount === 1}
          onPress={handleRemovePress}
        />

        <IconButton name={icons.ADD} onPress={handleAddPress} />
      </div>
    </div>
  );
}

export default FilterBuilderRow;
