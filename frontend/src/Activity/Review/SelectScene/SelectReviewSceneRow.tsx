import classNames from 'classnames';
import React, { useCallback } from 'react';
import Label from 'Components/Label';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import VirtualTableRowButton from 'Components/Table/VirtualTableRowButton';
import { kinds } from 'Helpers/Props';
import { ReviewCandidate } from 'typings/Review';
import translate from 'Utilities/String/translate';
import styles from './SelectReviewSceneRow.module.css';

interface SelectReviewSceneRowProps {
  scene: ReviewCandidate;
  isCandidate: boolean;
  onSceneSelect(scene: ReviewCandidate): void;
}

function SelectReviewSceneRow({
  scene,
  isCandidate,
  onSceneSelect,
}: SelectReviewSceneRowProps) {
  const { studioTitle, releaseDate, title, performerNames, hasFile } = scene;

  const performers = (performerNames ?? []).join(', ');

  const handlePress = useCallback(() => {
    onSceneSelect(scene);
  }, [scene, onSceneSelect]);

  return (
    <VirtualTableRowButton
      className={classNames(styles.row, hasFile && styles.hasFile)}
      isDisabled={hasFile}
      title={hasFile ? translate('ReviewChooseSceneHasFile') : undefined}
      onPress={handlePress}
    >
      <VirtualTableRowCell className={styles.studioTitle} title={studioTitle}>
        {studioTitle}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.releaseDate}>
        {releaseDate}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.title} title={title}>
        <span className={styles.titleText}>{title}</span>

        {isCandidate ? (
          <Label kind={kinds.INFO}>{translate('ReviewSuggestedScene')}</Label>
        ) : null}

        {scene.inLibrary === false ? (
          <Label
            kind={kinds.WARNING}
            title={translate('ReviewSceneNotInLibraryTooltip')}
          >
            {translate('ReviewSceneNotInLibrary')}
          </Label>
        ) : null}

        {hasFile ? (
          <Label kind={kinds.SUCCESS}>{translate('Downloaded')}</Label>
        ) : null}
      </VirtualTableRowCell>

      <VirtualTableRowCell className={styles.performers} title={performers}>
        {performers}
      </VirtualTableRowCell>
    </VirtualTableRowButton>
  );
}

export default SelectReviewSceneRow;
