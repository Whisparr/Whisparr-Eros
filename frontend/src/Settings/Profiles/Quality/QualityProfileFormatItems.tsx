import { debounce } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import FormGroup from 'Components/Form/FormGroup';
import FormInputHelpText from 'Components/Form/FormInputHelpText';
import FormLabel from 'Components/Form/FormLabel';
import InlineMarkdown from 'Components/Markdown/InlineMarkdown';
import { sizes } from 'Helpers/Props';
import { QualityProfileFormatItem as ProfileFormatItem } from 'typings/CustomFormat';
import { Failure } from 'typings/pending';
import translate from 'Utilities/String/translate';
import QualityProfileFormatItem from './QualityProfileFormatItem';
import styles from './QualityProfileFormatItems.css';

function calcOrder(profileFormatItems: ProfileFormatItem[]) {
  const items = profileFormatItems.reduce<Record<number, number>>(
    (acc, cur, index) => {
      acc[cur.format] = index;
      return acc;
    },
    {}
  );

  return [...profileFormatItems]
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.name.localeCompare(b.name, undefined, { numeric: true });
    })
    .map((x) => items[x.format]);
}

interface QualityProfileFormatItemsProps {
  profileFormatItems: ProfileFormatItem[];
  errors?: Failure[];
  warnings?: Failure[];
  onQualityProfileFormatItemScoreChange?: (
    formatId: number,
    score: number
  ) => void;
}

function QualityProfileFormatItems({
  profileFormatItems,
  errors = [],
  warnings = [],
  onQualityProfileFormatItemScoreChange,
}: Readonly<QualityProfileFormatItemsProps>) {
  const [order, setOrder] = useState(() => calcOrder(profileFormatItems));

  // The debounce fires a second after the last edit and re-reads the formats
  // then, which is what the class's `this.props` lookup did.
  const formatItemsRef = useRef(profileFormatItems);
  formatItemsRef.current = profileFormatItems;

  const reorderItems = useMemo(
    () => debounce(() => setOrder(calcOrder(formatItemsRef.current)), 1000),
    []
  );

  const handleScoreChange = useCallback(
    (formatId: number, value: number) => {
      onQualityProfileFormatItemScoreChange?.(formatId, value);
      reorderItems();
    },
    [reorderItems, onQualityProfileFormatItemScoreChange]
  );

  if (profileFormatItems.length < 1) {
    return (
      <InlineMarkdown
        className={styles.addCustomFormatMessage}
        data={translate('WantMoreControlAddACustomFormat')}
      />
    );
  }

  return (
    <FormGroup size={sizes.EXTRA_SMALL}>
      <FormLabel size={sizes.SMALL}>{translate('CustomFormats')}</FormLabel>

      <div>
        <FormInputHelpText text={translate('CustomFormatHelpText')} />

        {errors.map((error, index) => {
          return (
            <FormInputHelpText
              key={index}
              text={error.message}
              isError={true}
              isCheckInput={false}
            />
          );
        })}

        {warnings.map((warning, index) => {
          return (
            <FormInputHelpText
              key={index}
              text={warning.message}
              isWarning={true}
              isCheckInput={false}
            />
          );
        })}

        <div className={styles.formats}>
          <div className={styles.headerContainer}>
            <div className={styles.headerTitle}>
              {translate('CustomFormat')}
            </div>
            <div className={styles.headerScore}>{translate('Score')}</div>
          </div>
          {order.map((index) => {
            const { format, name, score } = profileFormatItems[index];
            return (
              <QualityProfileFormatItem
                key={format}
                formatId={format}
                name={name}
                score={score}
                onScoreChange={handleScoreChange}
              />
            );
          })}
        </div>
      </div>
    </FormGroup>
  );
}

export default QualityProfileFormatItems;
