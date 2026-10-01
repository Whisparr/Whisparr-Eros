import React from 'react';
import Scroller from 'Components/Scroller/Scroller';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';
import { ReviewCandidate } from 'typings/Review';
import translate from 'Utilities/String/translate';
import SelectReviewSceneRow from './SelectReviewSceneRow';
import styles from './SelectReviewSceneModalContent.module.css';

interface SelectReviewSceneTableProps {
  scenes: readonly ReviewCandidate[];
  candidateIds: number[];
  onSceneSelect(scene: ReviewCandidate): void;
}

function SelectReviewSceneTable({
  scenes,
  candidateIds,
  onSceneSelect,
}: SelectReviewSceneTableProps) {
  return (
    <>
      {scenes.length ? (
        <VirtualTableHeader>
          <VirtualTableHeaderCell
            className={styles.studioTitle}
            name="studioTitle"
          >
            {translate('Studio')}
          </VirtualTableHeaderCell>

          <VirtualTableHeaderCell
            className={styles.releaseDate}
            name="releaseDate"
          >
            {translate('ReleaseDate')}
          </VirtualTableHeaderCell>

          <VirtualTableHeaderCell className={styles.title} name="title">
            {translate('Title')}
          </VirtualTableHeaderCell>

          <VirtualTableHeaderCell
            className={styles.performers}
            name="performers"
          >
            {translate('Performers')}
          </VirtualTableHeaderCell>
        </VirtualTableHeader>
      ) : null}

      <Scroller className={styles.scroller} autoFocus={false}>
        {scenes.map((scene) => (
          <SelectReviewSceneRow
            key={scene.inLibrary === false ? scene.foreignId : scene.movieId}
            scene={scene}
            isCandidate={
              scene.movieId > 0 && candidateIds.includes(scene.movieId)
            }
            onSceneSelect={onSceneSelect}
          />
        ))}
      </Scroller>
    </>
  );
}

export default SelectReviewSceneTable;
