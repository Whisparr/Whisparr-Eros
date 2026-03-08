import React, { useEffect, useRef } from 'react';
import Scroller from 'Components/Scroller/Scroller';
import { HORIZONTAL } from 'Helpers/Props/scrollDirections';
import { SelectStateInputProps } from 'typings/props';
import { ImportItem, MovieLookupResult } from '../ImportMovieTypes';
import ImportMovieHeader from './ImportMovieHeader';
import ImportMovieRow from './ImportMovieRow';
import styles from './ImportMovieTable.css';

interface ImportMovieTableProps {
  readonly items: ImportItem[];
  readonly isLookingUp: boolean;
  readonly allSelected: boolean;
  readonly allUnselected: boolean;
  readonly selectedState: Record<string, boolean>;
  readonly onSelectAllChange: (opts: { value: boolean }) => void;
  readonly onSelectedChange: (opts: SelectStateInputProps) => void;
  readonly onRemoveSelectedStateItem: (id: string) => void;
  readonly onLookup: (opts: {
    id: string;
    term: string;
    itemType: 'movie' | 'scene';
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
  onSelectAllChange,
  onSelectedChange,
  onRemoveSelectedStateItem,
  onLookup,
  onMovieSelect,
  onItemValueChange,
}: ImportMovieTableProps) {
  const prevItemsRef = useRef<ImportItem[]>([]);

  // Auto-select/deselect rows as lookup results come in — mirrors the
  // componentDidUpdate logic from the original class component.
  useEffect(() => {
    const prevItems = prevItemsRef.current;

    prevItems.forEach((prevItem) => {
      const { id } = prevItem;
      const item = items.find((i) => i.id === id);

      if (!item) {
        onRemoveSelectedStateItem(id);
        return;
      }

      const { selectedMovie } = item;
      const isSelected = selectedState[id];

      // A selected movie that is an existing movie should be deselected
      if (
        (!selectedMovie && prevItem.selectedMovie) ||
        (selectedMovie?.isExisting && !prevItem.selectedMovie)
      ) {
        onSelectedChange({ id, value: false, shiftKey: false });
        return;
      }

      // Row is selected but no movie is chosen — deselect
      if (isSelected && !selectedMovie) {
        onSelectedChange({ id, value: false, shiftKey: false });
        return;
      }

      // A new movie was selected — auto-select the row
      if (selectedMovie && selectedMovie !== prevItem.selectedMovie) {
        onSelectedChange({ id, value: true, shiftKey: false });
      }
    });

    prevItemsRef.current = items;
  }, [items, onRemoveSelectedStateItem, onSelectedChange, selectedState]);

  if (!items.length) {
    return null;
  }

  return (
    <Scroller scrollDirection={HORIZONTAL}>
      <div className={styles.tableBody}>
        <ImportMovieHeader
          allSelected={allSelected}
          allUnselected={allUnselected}
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
