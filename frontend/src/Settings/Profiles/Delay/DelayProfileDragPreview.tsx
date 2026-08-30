import React from 'react';
import { useDragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { DELAY_PROFILE } from 'Helpers/dragTypes';
import dimensions from 'Styles/Variables/dimensions';
import DelayProfile from './DelayProfile';
import { DelayProfileDragItem } from './DelayProfileDragSource';
import styles from './DelayProfileDragPreview.css';

const dragHandleWidth = Number.parseInt(dimensions.dragHandleWidth, 10);

interface DelayProfileDragPreviewProps {
  width: number;
}

function DelayProfileDragPreview({
  width,
}: Readonly<DelayProfileDragPreviewProps>) {
  const { item, itemType, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem<DelayProfileDragItem | null>(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!currentOffset || itemType !== DELAY_PROFILE || !item) {
    return null;
  }

  // The offset is shifted because the drag handle is on the right edge of the
  // list item and the preview is wider than the drag handle.

  const { x, y } = currentOffset;
  const handleOffset = width - dragHandleWidth;
  const transform = `translate3d(${x - handleOffset}px, ${y}px, 0)`;

  const style = {
    width,
    position: 'absolute' as const,
    WebkitTransform: transform,
    msTransform: transform,
    transform,
  };

  return (
    <DragPreviewLayer>
      <div className={styles.dragPreview} style={style}>
        <DelayProfile
          delayProfile={item.delayProfile}
          tagList={item.tagList}
          isDragging={false}
        />
      </div>
    </DragPreviewLayer>
  );
}

export default DelayProfileDragPreview;
