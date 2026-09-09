import React, { useCallback } from 'react';
import NumberInput from 'Components/Form/NumberInput';
import { InputChanged } from 'typings/inputs';
import styles from './QualityProfileFormatItem.css';

export interface QualityProfileFormatItemProps {
  formatId: number;
  name: string;
  // The class defaulted this to 0 "to handle the case score is deleted during
  // edit", which React only applies to `undefined` -- see the handler below.
  score?: number;
  onScoreChange?: (formatId: number, score: number) => void;
}

function QualityProfileFormatItem({
  formatId,
  name,
  score = 0,
  onScoreChange,
}: Readonly<QualityProfileFormatItemProps>) {
  const handleScoreChange = useCallback(
    ({ value }: InputChanged<number | null>) => {
      // `NumberInput` reports a cleared field as `null`, which travels into the
      // profile and makes the save fail with a 400. Converted as it stands --
      // see the migration doc.
      onScoreChange?.(formatId, value as number);
    },
    [formatId, onScoreChange]
  );

  return (
    <div className={styles.qualityProfileFormatItemContainer}>
      <div className={styles.qualityProfileFormatItem}>
        <label className={styles.formatNameContainer}>
          <div className={styles.formatName}>{name}</div>
          <NumberInput
            className={styles.scoreInput}
            name={name}
            value={score}
            onChange={handleScoreChange}
          />
        </label>
      </div>
    </div>
  );
}

export default QualityProfileFormatItem;
