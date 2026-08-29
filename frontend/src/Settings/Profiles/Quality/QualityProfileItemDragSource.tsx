import classNames from 'classnames';
import React, { useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import { QualityProfileQualityItem } from 'typings/QualityProfile';
import QualityProfileItem from './QualityProfileItem';
import QualityProfileItemGroup from './QualityProfileItemGroup';
import styles from './QualityProfileItemDragSource.css';

// What the drag carries, and what the preview renders. `qualityIndex` is the
// `1`/`1.2` position string the modal parses back into a group and an item.
export interface QualityProfileItemDragItem {
  editGroups: boolean;
  qualityIndex: string;
  groupId?: number;
  qualityId?: number;
  isGroup: boolean;
  name: string;
  allowed: boolean;
}

export interface DragMoveOptions {
  dragQualityIndex: string;
  dropQualityIndex: string;
  dropPosition: 'above' | 'below';
}

interface QualityProfileItemDragSourceProps {
  editGroups: boolean;
  groupId?: number;
  qualityId?: number;
  name: string;
  allowed: boolean;
  items?: QualityProfileQualityItem[];
  qualityIndex: string;
  isDraggingUp?: boolean;
  isDraggingDown?: boolean;
  onCreateGroupPress?: (qualityId: number) => void;
  onDeleteGroupPress?: (groupId: number) => void;
  onQualityProfileItemAllowedChange: (
    qualityId: number,
    allowed: boolean
  ) => void;
  onItemGroupAllowedChange?: (groupId: number, allowed: boolean) => void;
  onItemGroupNameChange?: (groupId: number, name: string) => void;
  onQualityProfileItemDragMove: (options: DragMoveOptions) => void;
  onQualityProfileItemDragEnd: (didDrop: boolean) => void;
}

function QualityProfileItemDragSource({
  editGroups,
  groupId,
  qualityId,
  name,
  allowed,
  items,
  qualityIndex,
  isDraggingUp = false,
  isDraggingDown = false,
  onCreateGroupPress,
  onDeleteGroupPress,
  onQualityProfileItemAllowedChange,
  onItemGroupAllowedChange,
  onItemGroupNameChange,
  onQualityProfileItemDragMove,
  onQualityProfileItemDragEnd,
}: Readonly<QualityProfileItemDragSourceProps>) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Refs to capture current values for use inside hover handler
  const isDraggingUpRef = useRef(isDraggingUp);
  const isOverCurrentRef = useRef(false);
  isDraggingUpRef.current = isDraggingUp;

  const [{ isDragging }, drag] = useDrag<
    QualityProfileItemDragItem,
    unknown,
    { isDragging: boolean }
  >({
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

  const [{ isOverCurrent }, drop] = useDrop<
    QualityProfileItemDragItem,
    unknown,
    { isOverCurrent: boolean }
  >({
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

      // `getClientOffset` is null once the pointer leaves the drag layer; the
      // function read `.y` off it unguarded.
      if (!clientOffset) {
        return;
      }

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

      const dropPosition = ((): DragMoveOptions['dropPosition'] | null => {
        if (hoverClientY > hoverMiddleY) {
          return 'below';
        }

        if (hoverClientY < hoverMiddleY) {
          return 'above';
        }

        // Exactly on the middle: leave the current drop position alone.
        return null;
      })();

      if (!dropPosition) {
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

  const connectRef = useCallback(
    (node: HTMLDivElement | null) => {
      ref.current = node;
      drop(node);
    },
    [drop]
  );

  const isBefore = !isDragging && isDraggingUp && isOverCurrent;
  const isAfter = !isDragging && isDraggingDown && isOverCurrent;

  return (
    // The class also applied `styles.isDraggingUp` / `isDraggingDown` here,
    // neither of which this stylesheet has ever declared; the placeholder divs
    // below are what actually draw the drop position.
    <div ref={connectRef} className={styles.qualityProfileItemDragSource}>
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
          // A group always carries its qualities; the profile's own type leaves
          // `items` optional because a plain quality has none.
          items={items ?? []}
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
          isDragging={isDragging}
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

export default QualityProfileItemDragSource;
