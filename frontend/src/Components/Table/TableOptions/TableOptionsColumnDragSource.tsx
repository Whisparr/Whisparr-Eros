import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TABLE_COLUMN } from 'Helpers/dragTypes';
import { CheckInputChanged } from 'typings/inputs';
import TableOptionsColumn, {
  TableOptionsColumnProps,
} from './TableOptionsColumn';
import styles from './TableOptionsColumnDragSource.css';

// What the drag carries, and what the preview renders: the column itself plus
// the position `hover` compares against.
export interface TableColumnDragItem extends Pick<
  TableOptionsColumnProps,
  'name' | 'label' | 'isVisible' | 'isModifiable'
> {
  index: number;
}

interface TableOptionsColumnDragSourceProps extends TableColumnDragItem {
  isDraggingUp: boolean;
  isDraggingDown: boolean;
  onVisibleChange: (change: CheckInputChanged) => void;
  onColumnDragMove: (dragIndex: number, dropIndex: number) => void;
  onColumnDragEnd: (didDrop: boolean) => void;
}

function TableOptionsColumnDragSource({
  name,
  label,
  isVisible,
  isModifiable,
  index,
  isDraggingUp,
  isDraggingDown,
  onVisibleChange,
  onColumnDragMove,
  onColumnDragEnd,
}: Readonly<TableOptionsColumnDragSourceProps>) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag<
    TableColumnDragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: TABLE_COLUMN,
    item: () => ({ name, label, isVisible, isModifiable, index }),
    end: (_item, monitor) => {
      onColumnDragEnd(monitor.didDrop());
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop<
    TableColumnDragItem,
    unknown,
    { isOver: boolean }
  >({
    accept: TABLE_COLUMN,
    hover: (item, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      if (!ref.current) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      // `getClientOffset` is null once the pointer leaves the drag layer; the
      // class read `.y` off it unguarded.
      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex === hoverIndex) {
        return;
      }

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onColumnDragMove(dragIndex, hoverIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const connectRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      drop(node);
    },
    [drop]
  );

  const isBefore = !isDragging && isDraggingUp && isOver;
  const isAfter = !isDragging && isDraggingDown && isOver;

  return (
    // The class also applied `styles.isDraggingUp` / `isDraggingDown` here,
    // neither of which this stylesheet has ever declared; the placeholder
    // divs below are what actually draw the drop position.
    <div ref={connectRef} className={styles.columnDragSource}>
      {isBefore && (
        <div
          className={classNames(
            styles.columnPlaceholder,
            styles.columnPlaceholderBefore
          )}
        />
      )}

      <TableOptionsColumn
        name={name}
        label={typeof label === 'function' ? label() : label}
        isVisible={isVisible}
        isModifiable={isModifiable}
        isDragging={isDragging}
        connectDragSource={drag}
        onVisibleChange={onVisibleChange}
      />

      {isAfter && (
        <div
          className={classNames(
            styles.columnPlaceholder,
            styles.columnPlaceholderAfter
          )}
        />
      )}
    </div>
  );
}

export default TableOptionsColumnDragSource;
