import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DELAY_PROFILE } from 'Helpers/dragTypes';
import DelayProfile from './DelayProfile';
import styles from './DelayProfileDragSource.css';

function DelayProfileDragSource({
  id,
  order,
  isDraggingUp,
  isDraggingDown,
  onDelayProfileDragMove,
  onDelayProfileDragEnd,
  ...otherProps
}) {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: DELAY_PROFILE,
    item: () => ({ id, order, isDraggingUp, isDraggingDown, ...otherProps }),
    end: (item, monitor) => {
      onDelayProfileDragEnd(item, monitor.didDrop());
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: DELAY_PROFILE,
    hover: (item, monitor) => {
      const dragIndex = item.order;
      const hoverIndex = order;

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

      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
        onDelayProfileDragMove(dragIndex, hoverIndex + 1);
      } else if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
        onDelayProfileDragMove(dragIndex, hoverIndex);
      }
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
        styles.delayProfileDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
      {isBefore && (
        <div
          className={classNames(
            styles.delayProfilePlaceholder,
            styles.delayProfilePlaceholderBefore
          )}
        />
      )}

      <DelayProfile
        id={id}
        order={order}
        isDragging={isDragging}
        isOver={isOver}
        {...otherProps}
        connectDragSource={drag}
      />

      {isAfter && (
        <div
          className={classNames(
            styles.delayProfilePlaceholder,
            styles.delayProfilePlaceholderAfter
          )}
        />
      )}
    </div>
  );
}

DelayProfileDragSource.propTypes = {
  id: PropTypes.number.isRequired,
  order: PropTypes.number.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onDelayProfileDragMove: PropTypes.func.isRequired,
  onDelayProfileDragEnd: PropTypes.func.isRequired,
};

export default DelayProfileDragSource;
