import React, { useCallback, useEffect, useRef } from 'react';
import { GridCellProps } from 'react-virtualized';
import ModelBase from 'App/ModelBase';
import VirtualTable from 'Components/Table/VirtualTable';
import VirtualTableRow from 'Components/Table/VirtualTableRow';
import { SelectStateInputProps } from 'typings/props';
import { ImportItem, MovieLookupResult } from '../ImportMovieTypes';
import ImportMovieHeader from './ImportMovieHeader';
import ImportMovieRow from './ImportMovieRow';

interface ImportMovieTableProps {
  readonly items: ImportItem[];
  readonly isLookingUp: boolean;
  readonly allSelected: boolean;
  readonly allUnselected: boolean;
  readonly selectedState: Record<string, boolean>;
  readonly isSmallScreen: boolean;
  readonly scroller: Element;
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
  isSmallScreen,
  scroller,
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

  const rowRenderer = useCallback(
    ({ key, rowIndex, style }: GridCellProps) => {
      const item = items[rowIndex];

      return (
        <VirtualTableRow key={key} style={style}>
          <ImportMovieRow
            item={item}
            isSelected={selectedState[item.id] ?? false}
            isLookingUp={isLookingUp}
            onSelectedChange={onSelectedChange}
            onLookup={onLookup}
            onMovieSelect={onMovieSelect}
            onItemValueChange={onItemValueChange}
          />
        </VirtualTableRow>
      );
    },
    [
      items,
      selectedState,
      isLookingUp,
      onSelectedChange,
      onLookup,
      onMovieSelect,
      onItemValueChange,
    ]
  );

  if (!items.length) {
    return null;
  }

  return (
    <VirtualTable
      items={items as unknown as ModelBase[]}
      isSmallScreen={isSmallScreen}
      scroller={scroller}
      rowHeight={52}
      rowRenderer={rowRenderer}
      header={
        <ImportMovieHeader
          allSelected={allSelected}
          allUnselected={allUnselected}
          onSelectAllChange={onSelectAllChange}
        />
      }
    />
  );
}

export default ImportMovieTable;
