import React from 'react';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';
import VirtualTableSelectAllHeaderCell from 'Components/Table/VirtualTableSelectAllHeaderCell';
import translate from 'Utilities/String/translate';
import styles from './ImportMovieHeader.css';

interface ImportMovieHeaderProps {
  allSelected: boolean;
  allUnselected: boolean;
  onSelectAllChange: (opts: { value: boolean }) => void;
}

function ImportMovieHeader({
  allSelected,
  allUnselected,
  onSelectAllChange,
}: Readonly<ImportMovieHeaderProps>) {
  return (
    <VirtualTableHeader>
      <VirtualTableSelectAllHeaderCell
        allSelected={allSelected}
        allUnselected={allUnselected}
        onSelectAllChange={onSelectAllChange}
      />

      <VirtualTableHeaderCell className={styles.folder} name="folder">
        {translate('Folder')}
      </VirtualTableHeaderCell>

      <VirtualTableHeaderCell className={styles.movie} name="movie">
        {translate('Movie')}
      </VirtualTableHeaderCell>

      <VirtualTableHeaderCell className={styles.monitor} name="monitor">
        {translate('Monitor')}
      </VirtualTableHeaderCell>

      <VirtualTableHeaderCell
        className={styles.qualityProfile}
        name="qualityProfileId"
      >
        {translate('QualityProfile')}
      </VirtualTableHeaderCell>
    </VirtualTableHeader>
  );
}

export default ImportMovieHeader;
