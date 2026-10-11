import { arrayMove, move } from '@dnd-kit/helpers';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { useCallback, useMemo, useState } from 'react';
import {
  QualityProfileGroup,
  QualityProfileItem,
  QualityProfileQualityItem,
} from 'typings/QualityProfile';

// Sortable ids have to be unique across the whole board, and a group and a
// quality can share a numeric id, so each kind gets its own prefix.
export const ROOT_CONTAINER = 'root';

export const qualityKey = (id: number) => `q-${id}`;
export const groupContainerKey = (id: number) => `g-${id}`;

// Container id -> the sortable ids inside it, in display order. The root holds
// qualities and groups; each group's container holds its qualities.
type Board = Record<string, string[]>;

export type DisplayItem =
  | { kind: 'quality'; item: QualityProfileQualityItem }
  | {
      kind: 'group';
      group: QualityProfileGroup;
      items: QualityProfileQualityItem[];
    };

function isGroup(item: QualityProfileItem): item is QualityProfileGroup {
  return !item.quality;
}

// Profiles store items lowest quality first and the list shows them highest
// first, so the board is reversed on the way in and back on the way out.
function toBoard(items: QualityProfileItem[]): Board {
  const board: Board = { [ROOT_CONTAINER]: [] };

  [...items].reverse().forEach((item) => {
    if (isGroup(item)) {
      board[ROOT_CONTAINER].push(groupContainerKey(item.id));
      board[groupContainerKey(item.id)] = [...item.items]
        .reverse()
        .map((groupItem) => qualityKey(groupItem.quality.id));
    } else {
      board[ROOT_CONTAINER].push(qualityKey(item.quality.id));
    }
  });

  return board;
}

function buildLookups(items: QualityProfileItem[]) {
  const qualities = new Map<string, QualityProfileQualityItem>();
  const groups = new Map<string, QualityProfileGroup>();

  items.forEach((item) => {
    if (isGroup(item)) {
      groups.set(groupContainerKey(item.id), item);
      item.items.forEach((groupItem) => {
        qualities.set(qualityKey(groupItem.quality.id), groupItem);
      });
    } else {
      qualities.set(qualityKey(item.quality.id), item);
    }
  });

  return { qualities, groups };
}

function toDisplayItems(
  board: Board,
  items: QualityProfileItem[]
): DisplayItem[] {
  const { qualities, groups } = buildLookups(items);

  return board[ROOT_CONTAINER].map((key) => {
    const group = groups.get(key);

    if (group) {
      return {
        kind: 'group' as const,
        group,
        items: (board[key] ?? []).map((k) => qualities.get(k)!),
      };
    }

    return { kind: 'quality' as const, item: qualities.get(key)! };
  });
}

function fromBoard(board: Board, items: QualityProfileItem[]) {
  const { qualities, groups } = buildLookups(items);

  return (
    board[ROOT_CONTAINER].map<QualityProfileItem>((key) => {
      const group = groups.get(key);

      if (group) {
        return {
          ...group,
          items: (board[key] ?? []).map((k) => qualities.get(k)!).reverse(),
        };
      }

      return qualities.get(key)!;
    })
      // A group whose last quality was dragged out is removed.
      .filter((item) => !isGroup(item) || item.items.length > 0)
      .reverse()
  );
}

// A group only ever moves within the root; groups do not nest. Optimistic
// sorting slides the dragged group under the pointer, so by the time the drag
// ends its drop target is usually the group itself. Its sortable indexes still
// say where it started and where it landed, so those drive the move instead.
function moveGroup(board: Board, event: DragEndEvent): Board {
  const { source } = event.operation;

  if (!isSortable(source)) {
    return board;
  }

  const { initialIndex, index } = source;

  if (initialIndex === index) {
    return board;
  }

  return {
    ...board,
    [ROOT_CONTAINER]: arrayMove(board[ROOT_CONTAINER], initialIndex, index),
  };
}

export default function useQualityProfileDnd(
  items: QualityProfileItem[],
  onItemsChange: (items: QualityProfileItem[]) => void
) {
  // Only set while a drag is in progress; otherwise the list is read straight
  // off the profile's items.
  const [board, setBoard] = useState<Board | null>(null);

  const displayItems = useMemo(
    () => toDisplayItems(board ?? toBoard(items), items),
    [board, items]
  );

  const handleDragStart = useCallback(() => {
    setBoard(toBoard(items));
  }, [items]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (event.operation.source?.type === 'group') {
      return;
    }

    setBoard((current) => (current ? move(current, event) : current));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setBoard((current) => {
        if (current && !event.canceled) {
          const next =
            event.operation.source?.type === 'group'
              ? moveGroup(current, event)
              : move(current, event);

          onItemsChange(fromBoard(next, items));
        }

        return null;
      });
    },
    [items, onItemsChange]
  );

  return { displayItems, handleDragStart, handleDragOver, handleDragEnd };
}
