import React, { useCallback } from 'react';
import { useDragLayer } from 'react-dnd';
import DragPreviewLayer from 'Components/DragPreviewLayer';
import { TABLE_COLUMN } from 'Helpers/dragTypes';
import dimensions from 'Styles/Variables/dimensions';
import TableOptionsColumn from './TableOptionsColumn';
import { TableColumnDragItem } from './TableOptionsColumnDragSource';
import styles from './TableOptionsColumnDragPreview.css';

const formGroupSmallWidth = Number.parseInt(dimensions.formGroupSmallWidth, 10);
const formLabelLargeWidth = Number.parseInt(dimensions.formLabelLargeWidth, 10);
const formLabelRightMarginWidth = Number.parseInt(
  dimensions.formLabelRightMarginWidth,
  10
);
const dragHandleWidth = Number.parseInt(dimensions.dragHandleWidth, 10);

function TableOptionsColumnDragPreview() {
  const { item, itemType, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem<TableColumnDragItem | null>(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
  }));

  // The preview sits in a `pointer-events: none` layer, so the check input it
  // draws can never be changed; the class left the handler off entirely.
  const handleVisibleChange = useCallback(() => {
    // No-op.
  }, []);

  if (!currentOffset || itemType !== TABLE_COLUMN || !item) {
    return null;
  }

  // The offset is shifted because the drag handle is on the right edge of the
  // list item and the preview is wider than the drag handle.

  const { x, y } = currentOffset;
  const handleOffset =
    formGroupSmallWidth -
    formLabelLargeWidth -
    formLabelRightMarginWidth -
    dragHandleWidth;
  const transform = `translate3d(${x - handleOffset}px, ${y}px, 0)`;

  const style = {
    position: 'absolute' as const,
    WebkitTransform: transform,
    msTransform: transform,
    transform,
  };

  return (
    <DragPreviewLayer>
      <div className={styles.dragPreview} style={style}>
        <TableOptionsColumn
          isDragging={false}
          {...item}
          onVisibleChange={handleVisibleChange}
        />
      </div>
    </DragPreviewLayer>
  );
}

export default TableOptionsColumnDragPreview;
