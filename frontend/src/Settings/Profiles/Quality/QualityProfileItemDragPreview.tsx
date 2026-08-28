import React from 'react';
import { useDragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import dimensions from 'Styles/Variables/dimensions';
import QualityProfileItem from './QualityProfileItem';
import { QualityProfileItemDragItem } from './QualityProfileItemDragSource';
import styles from './QualityProfileItemDragPreview.css';

const formGroupExtraSmallWidth = Number.parseInt(
  dimensions.formGroupExtraSmallWidth,
  10
);
const formLabelSmallWidth = Number.parseInt(dimensions.formLabelSmallWidth, 10);
const formLabelRightMarginWidth = Number.parseInt(
  dimensions.formLabelRightMarginWidth,
  10
);
const dragHandleWidth = Number.parseInt(dimensions.dragHandleWidth, 10);

function QualityProfileItemDragPreview() {
  const { item, itemType, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem<QualityProfileItemDragItem | null>(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  if (!currentOffset || itemType !== QUALITY_PROFILE_ITEM || !item) {
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
    position: 'absolute' as const,
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
          // A group is dragged by its own id; either way this only reaches the
          // check input's change handler, which the preview does not connect.
          qualityId={groupId ?? qualityId ?? 0}
          name={name}
          allowed={allowed}
          isDragging={false}
        />
      </div>
    </DragPreviewLayer>
  );
}

export default QualityProfileItemDragPreview;
