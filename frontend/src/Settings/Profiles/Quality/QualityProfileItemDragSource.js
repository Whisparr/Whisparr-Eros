import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import QualityProfileItem from './QualityProfileItem';
import QualityProfileItemGroup from './QualityProfileItemGroup';
import styles from './QualityProfileItemDragSource.css';

function QualityProfileItemDragSource({
  editGroups,
  groupId,
  qualityId,
  name,
  allowed,
  items,
  qualityIndex,
  isDraggingUp,
  isDraggingDown,
  onCreateGroupPress,
  onDeleteGroupPress,
  onQualityProfileItemAllowedChange,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
  onQualityProfileItemDragMove,
  onQualityProfileItemDragEnd,
}) {
  const ref = useRef(null);

  // Refs to capture current values for use inside hover handler
  const isDraggingUpRef = useRef(isDraggingUp);
  const isOverCurrentRef = useRef(false);
  isDraggingUpRef.current = isDraggingUp;

  const [{ isDragging }, drag] = useDrag({
    type: QUALITY_PROFILE_ITEM,
    item: () => ({
      editGroups,
      qualityIndex,
      groupId,
      qualityId,
      isGroup: !qualityId,
      name,
      allowed,
    }),
    end: (_item, monitor) => {
      onQualityProfileItemDragEnd(monitor.didDrop());
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOverCurrent }, drop] = useDrop({
    accept: QUALITY_PROFILE_ITEM,
    hover: (item, monitor) => {
      const { qualityIndex: dragQualityIndex, isGroup: isDragGroup } = item;
      const dropQualityIndex = qualityIndex;
      const isDropGroupItem = !!(qualityId && groupId);

      // Use childNodeIndex to select the correct node to get the middle of so
      // we don't bounce between above and below causing rapid setState calls.
      const childNodeIndex =
        isOverCurrentRef.current && isDraggingUpRef.current ? 1 : 0;

      if (!ref.current) {
        return;
      }

      const componentDOMNode = ref.current.children[childNodeIndex];

      if (!componentDOMNode) {
        return;
      }

      const hoverBoundingRect = componentDOMNode.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // If we're hovering over a child don't trigger on the parent
      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      if (dragQualityIndex === dropQualityIndex) {
        return;
      }

      if (isDragGroup && isDropGroupItem) {
        return;
      }

      let dropPosition = null;

      if (hoverClientY > hoverMiddleY) {
        dropPosition = 'below';
      } else if (hoverClientY < hoverMiddleY) {
        dropPosition = 'above';
      } else {
        return;
      }

      onQualityProfileItemDragMove({
        dragQualityIndex,
        dropQualityIndex,
        dropPosition,
      });
    },
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
    }),
  });

  // Keep ref in sync with latest collected value
  isOverCurrentRef.current = isOverCurrent;

  const connectRef = (node) => {
    ref.current = node;
    drop(node);
  };

  const isBefore = !isDragging && isDraggingUp && isOverCurrent;
  const isAfter = !isDragging && isDraggingDown && isOverCurrent;

  return (
    <div
      ref={connectRef}
      className={classNames(
        styles.qualityProfileItemDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
      {isBefore && (
        <div
          className={classNames(
            styles.qualityProfileItemPlaceholder,
            styles.qualityProfileItemPlaceholderBefore
          )}
        />
      )}

      {!!groupId && qualityId == null && (
        <QualityProfileItemGroup
          editGroups={editGroups}
          groupId={groupId}
          name={name}
          allowed={allowed}
          items={items}
          qualityIndex={qualityIndex}
          isDragging={isDragging}
          isDraggingUp={isDraggingUp}
          isDraggingDown={isDraggingDown}
          connectDragSource={drag}
          onDeleteGroupPress={onDeleteGroupPress}
          onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
          onItemGroupAllowedChange={onItemGroupAllowedChange}
          onItemGroupNameChange={onItemGroupNameChange}
          onQualityProfileItemDragMove={onQualityProfileItemDragMove}
          onQualityProfileItemDragEnd={onQualityProfileItemDragEnd}
        />
      )}

      {qualityId != null && (
        <QualityProfileItem
          editGroups={editGroups}
          groupId={groupId}
          qualityId={qualityId}
          name={name}
          allowed={allowed}
          qualityIndex={qualityIndex}
          isDragging={isDragging}
          isOverCurrent={isOverCurrent}
          connectDragSource={drag}
          onCreateGroupPress={onCreateGroupPress}
          onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
        />
      )}

      {isAfter && (
        <div
          className={classNames(
            styles.qualityProfileItemPlaceholder,
            styles.qualityProfileItemPlaceholderAfter
          )}
        />
      )}
    </div>
  );
}

QualityProfileItemDragSource.propTypes = {
  editGroups: PropTypes.bool.isRequired,
  groupId: PropTypes.number,
  qualityId: PropTypes.number,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  qualityIndex: PropTypes.string.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onCreateGroupPress: PropTypes.func,
  onDeleteGroupPress: PropTypes.func,
  onQualityProfileItemAllowedChange: PropTypes.func.isRequired,
  onItemGroupAllowedChange: PropTypes.func,
  onItemGroupNameChange: PropTypes.func,
  onQualityProfileItemDragMove: PropTypes.func.isRequired,
  onQualityProfileItemDragEnd: PropTypes.func.isRequired,
};

export default QualityProfileItemDragSource;
