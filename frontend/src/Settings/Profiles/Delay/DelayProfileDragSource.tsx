import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DELAY_PROFILE } from 'Helpers/dragTypes';
import { Tag } from 'Tags/useTags';
import DelayProfile from './DelayProfile';
import { DelayProfile as DelayProfileModel } from './useDelayProfiles';
import styles from './DelayProfileDragSource.css';

export interface DelayProfileDragItem {
  delayProfile: DelayProfileModel;
  tagList: readonly Tag[];
}

interface DelayProfileDragSourceProps extends DelayProfileDragItem {
  isDraggingUp: boolean;
  isDraggingDown: boolean;
  onDelayProfileDragMove: (dragIndex: number, dropIndex: number) => void;
  onDelayProfileDragEnd: (id: number, didDrop: boolean) => void;
}

function DelayProfileDragSource({
  delayProfile,
  tagList,
  isDraggingUp,
  isDraggingDown,
  onDelayProfileDragMove,
  onDelayProfileDragEnd,
}: Readonly<DelayProfileDragSourceProps>) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { order } = delayProfile;

  const [{ isDragging }, drag] = useDrag<
    DelayProfileDragItem,
    unknown,
    { isDragging: boolean }
  >({
    type: DELAY_PROFILE,
    item: () => ({ delayProfile, tagList }),
    end: (item, monitor) => {
      onDelayProfileDragEnd(item.delayProfile.id, monitor.didDrop());
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop<
    DelayProfileDragItem,
    unknown,
    { isOver: boolean }
  >({
    accept: DELAY_PROFILE,
    hover: (item, monitor) => {
      const dragIndex = item.delayProfile.order;
      const hoverIndex = order;

      if (!ref.current) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

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
    <div ref={connectRef} className={styles.delayProfileDragSource}>
      {isBefore && (
        <div
          className={classNames(
            styles.delayProfilePlaceholder,
            styles.delayProfilePlaceholderBefore
          )}
        />
      )}

      <DelayProfile
        delayProfile={delayProfile}
        tagList={tagList}
        isDragging={isDragging}
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

export default DelayProfileDragSource;
