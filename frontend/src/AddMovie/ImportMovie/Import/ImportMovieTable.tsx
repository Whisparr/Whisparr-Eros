import React from 'react';
import Scroller from 'Components/Scroller/Scroller';
import { HORIZONTAL } from 'Helpers/Props/scrollDirections';
import { SortDirection } from 'Helpers/Props/sortDirections';
import { SelectStateInputProps } from 'typings/props';
import {
  ImportItem,
  ImportItemType,
  MovieLookupResult,
} from '../ImportMovieTypes';
import ImportMovieHeader from './ImportMovieHeader';
import ImportMovieRow from './ImportMovieRow';
import styles from './ImportMovieTable.module.css';

interface ImportMovieTableProps {
  readonly items: ImportItem[];
  readonly isLookingUp: boolean;
  readonly allSelected: boolean;
  readonly allUnselected: boolean;
  readonly selectedState: Record<string, boolean>;
  readonly sortDirection: SortDirection;
  readonly onSortPress: () => void;
  readonly onSelectAllChange: (opts: { value: boolean }) => void;
  readonly onSelectedChange: (opts: SelectStateInputProps) => void;
  readonly onLookup: (opts: {
    id: string;
    term: string;
    itemType?: ImportItemType;
    topOfQueue: boolean;
  }) => void;
  readonly onMovieSelect: (id: string, movie: MovieLookupResult) => void;
  readonly onItemValueChange: (
    id: string,
    key: 'monitor' | 'qualityProfileId',
    value: string | number
  ) => void;
}

function ImportMovieTable({
  items,
  isLookingUp,
  allSelected,
  allUnselected,
  selectedState,
  sortDirection,
  onSortPress,
  onSelectAllChange,
  onSelectedChange,
  onLookup,
  onMovieSelect,
  onItemValueChange,
}: ImportMovieTableProps) {
  if (!items.length) {
    return null;
  }

  return (
    <Scroller scrollDirection={HORIZONTAL}>
      <div className={styles.tableBody}>
        <ImportMovieHeader
          allSelected={allSelected}
          allUnselected={allUnselected}
          sortDirection={sortDirection}
          onSortPress={onSortPress}
          onSelectAllChange={onSelectAllChange}
        />

        {items.map((item) => (
          <div key={item.id} className={styles.row}>
            <ImportMovieRow
              item={item}
              isSelected={selectedState[item.id] ?? false}
              isLookingUp={isLookingUp}
              onSelectedChange={onSelectedChange}
              onLookup={onLookup}
              onMovieSelect={onMovieSelect}
              onItemValueChange={onItemValueChange}
            />
          </div>
        ))}
      </div>
    </Scroller>
  );
}

export default ImportMovieTable;
