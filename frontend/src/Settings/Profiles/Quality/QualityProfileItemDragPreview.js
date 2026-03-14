import React from 'react';
import { useDragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import dimensions from 'Styles/Variables/dimensions.js';
import QualityProfileItem from './QualityProfileItem';
import styles from './QualityProfileItemDragPreview.css';

const formGroupExtraSmallWidth = parseInt(dimensions.formGroupExtraSmallWidth);
const formLabelSmallWidth = parseInt(dimensions.formLabelSmallWidth);
const formLabelRightMarginWidth = parseInt(
  dimensions.formLabelRightMarginWidth
);
const dragHandleWidth = parseInt(dimensions.dragHandleWidth);

function QualityProfileItemDragPreview() {
  const { item, itemType, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!currentOffset || itemType !== QUALITY_PROFILE_ITEM) {
    return null;
  }

  // The offset is shifted because the drag handle is on the right edge of the
  // list item and the preview is wider than the drag handle.

  const { x, y } = currentOffset;
  const handleOffset =
    formGroupExtraSmallWidth -
    formLabelSmallWidth -
    formLabelRightMarginWidth -
    dragHandleWidth;
  const transform = `translate3d(${x - handleOffset}px, ${y}px, 0)`;

  const style = {
    position: 'absolute',
    WebkitTransform: transform,
    msTransform: transform,
    transform,
  };

  const { editGroups, groupId, qualityId, name, allowed } = item;

  // TODO: Show a different preview for groups

  return (
    <DragPreviewLayer>
      <div className={styles.dragPreview} style={style}>
        <QualityProfileItem
          editGroups={editGroups}
          isPreview={true}
          qualityId={groupId || qualityId}
          name={name}
          allowed={allowed}
          isDragging={false}
        />
      </div>
    </DragPreviewLayer>
  );
}

export default QualityProfileItemDragPreview;
