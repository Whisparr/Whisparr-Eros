import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TABLE_COLUMN } from 'Helpers/dragTypes';
import TableOptionsColumn from './TableOptionsColumn';
import styles from './TableOptionsColumnDragSource.css';

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
}) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: TABLE_COLUMN,
    item: () => ({ name, label, isVisible, isModifiable, index }),
    end: (item, monitor) => {
      onColumnDragEnd(item, monitor.didDrop());
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
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

  const connectRef = (node) => {
    ref.current = node;
    drop(node);
  };

  const isBefore = !isDragging && isDraggingUp && isOver;
  const isAfter = !isDragging && isDraggingDown && isOver;

  return (
    <div
      ref={connectRef}
      className={classNames(
        styles.columnDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
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
        index={index}
        isDragging={isDragging}
        isOver={isOver}
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

TableOptionsColumnDragSource.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  isVisible: PropTypes.bool.isRequired,
  isModifiable: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onVisibleChange: PropTypes.func.isRequired,
  onColumnDragMove: PropTypes.func.isRequired,
  onColumnDragEnd: PropTypes.func.isRequired,
};

export default TableOptionsColumnDragSource;
