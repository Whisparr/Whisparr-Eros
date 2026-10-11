import { useSortable } from '@dnd-kit/react/sortable';
import classNames from 'classnames';
import React from 'react';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import Column, { IsModifiable } from 'Components/Table/Column';
import { icons } from 'Helpers/Props';
import { CheckInputChanged } from 'typings/inputs';
import styles from './TableOptionsColumn.module.css';

export interface TableOptionsColumnProps {
  name: string;
  label: Column['label'];
  isVisible: boolean;
  isModifiable: IsModifiable;
  index: number;
  onVisibleChange: (change: CheckInputChanged) => void;
}

function TableOptionsColumn({
  name,
  label,
  isVisible,
  isModifiable,
  index,
  onVisibleChange,
}: Readonly<TableOptionsColumnProps>) {
  const isDraggable = isModifiable !== 'disabled';

  const { ref, handleRef, isDragging } = useSortable({
    id: name,
    index,
    disabled: !isDraggable,
  });

  return (
    <div ref={ref} className={styles.columnContainer}>
      <div
        className={classNames(styles.column, isDragging && styles.isDragging)}
      >
        <label className={styles.label}>
          <CheckInput
            containerClassName={styles.checkContainer}
            name={name}
            value={isVisible}
            isDisabled={isModifiable !== 'enabled'}
            onChange={onVisibleChange}
          />
          {typeof label === 'function' ? label() : label}
        </label>

        {isDraggable ? (
          <div ref={handleRef} className={styles.dragHandle}>
            <Icon className={styles.dragIcon} name={icons.REORDER} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TableOptionsColumn;
