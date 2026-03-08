import React, { useCallback } from 'react';
import FormInputGroup from 'Components/Form/FormInputGroup';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import VirtualTableSelectCell from 'Components/Table/Cells/VirtualTableSelectCell';
import { inputTypes } from 'Helpers/Props';
import { SelectStateInputProps } from 'typings/props';
import { ImportItem, MovieLookupResult } from '../ImportMovieTypes';
import ImportMovieSelectMovie from './SelectMovie/ImportMovieSelectMovie';
import styles from './ImportMovieRow.css';

interface ImportMovieRowProps {
  readonly item: ImportItem;
  readonly isSelected: boolean;
  readonly isLookingUp: boolean;
  readonly onSelectedChange: (opts: SelectStateInputProps) => void;
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

function ImportMovieRow({
  item,
  isSelected,
  isLookingUp,
  onSelectedChange,
  onLookup,
  onMovieSelect,
  onItemValueChange,
}: ImportMovieRowProps) {
  const { id, relativePath, monitor, qualityProfileId, selectedMovie, items } =
    item;

  // Must be declared before any early return to satisfy rules of hooks
  const handleInputChange = useCallback(
    ({ name, value }: { name: string; value: string | number }) => {
      onItemValueChange(id, name as 'monitor' | 'qualityProfileId', value);
    },
    [id, onItemValueChange]
  );

  // Don't render the row until required fields are initialised
  if (!items || !monitor) {
    return null;
  }

  return (
    <>
      <VirtualTableSelectCell
        className={styles.selectCell}
        inputClassName={styles.selectInput}
        id={id}
        isSelected={isSelected}
        isDisabled={!selectedMovie}
        onSelectedChange={onSelectedChange}
      />

      <VirtualTableRowCell className={styles.folder} title={relativePath}>
        {relativePath}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.movie}>
        <ImportMovieSelectMovie
          item={item}
          isLookingUp={isLookingUp}
          onLookup={onLookup}
          onMovieSelect={onMovieSelect}
        />
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.monitor}>
        <FormInputGroup
          type={inputTypes.MONITOR_MOVIES_SELECT}
          name="monitor"
          value={monitor}
          onChange={handleInputChange}
        />
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.qualityProfile}>
        <FormInputGroup
          type={inputTypes.QUALITY_PROFILE_SELECT}
          name="qualityProfileId"
          value={qualityProfileId}
          onChange={handleInputChange}
        />
      </VirtualTableRowCell>
    </>
  );
}

export default ImportMovieRow;
