import classNames from 'classnames';
import React from 'react';
import { ConnectDragSource } from 'react-dnd';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import Column, { IsModifiable } from 'Components/Table/Column';
import { icons } from 'Helpers/Props';
import { CheckInputChanged } from 'typings/inputs';
import styles from './TableOptionsColumn.css';

export interface TableOptionsColumnProps {
  name: string;
  label: Column['label'];
  isVisible: boolean;
  isModifiable: IsModifiable;
  isDragging?: boolean;
  // The drag preview renders the column without a drag handle to connect.
  connectDragSource?: ConnectDragSource;
  onVisibleChange: (change: CheckInputChanged) => void;
}

function TableOptionsColumn({
  name,
  label,
  isVisible,
  isModifiable,
  isDragging,
  connectDragSource,
  onVisibleChange,
}: Readonly<TableOptionsColumnProps>) {
  const isDraggable = isModifiable !== 'disabled';

  return (
    <div className={isDraggable ? undefined : styles.notDragable}>
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

        {isDraggable &&
          !!connectDragSource &&
          connectDragSource(
            <div className={styles.dragHandle}>
              <Icon className={styles.dragIcon} name={icons.REORDER} />
            </div>
          )}
      </div>
    </div>
  );
}

export default TableOptionsColumn;
