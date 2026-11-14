import { useCallback, useEffect, useRef, useState } from 'react';
import InteractiveImport from 'InteractiveImport/InteractiveImport';

export default function useImportSelection(
  items: readonly InteractiveImport[],
  pageItems: readonly InteractiveImport[],
  allowMovieChange: boolean,
  scope: string
) {
  const [selectedState, setSelectedState] = useState<Record<number, boolean>>(
    {}
  );
  const lastToggled = useRef<number | null>(null);
  const explicitSelections = useRef(new Set<number>());
  const previousScope = useRef(scope);

  // Initialize all rows together. Row mount effects would reselect unchecked
  // files on every page visit and leave unmounted rows out of validation.
  useEffect(() => {
    const scopeChanged = previousScope.current !== scope;
    previousScope.current = scope;

    if (scopeChanged) {
      lastToggled.current = null;
      explicitSelections.current.clear();
    }

    setSelectedState((existing) => {
      const previous = scopeChanged ? {} : existing;
      const next: Record<number, boolean> = {};
      let changed = Object.keys(previous).length !== items.length;

      items.forEach((item) => {
        const canAutoSelect = !!(
          allowMovieChange &&
          item.movie &&
          item.quality &&
          item.languages &&
          item.size > 0
        );
        next[item.id] = previous[item.id] ?? canAutoSelect;

        if (!canAutoSelect && !explicitSelections.current.has(item.id)) {
          next[item.id] = false;
        }

        changed ||= next[item.id] !== previous[item.id];
      });

      return changed ? next : previous;
    });
  }, [items, allowMovieChange, scope]);

  const selectPage = useCallback(
    (value: boolean) => {
      lastToggled.current = null;
      setSelectedState((previous) => {
        const next = { ...previous };
        pageItems.forEach(({ id }) => {
          explicitSelections.current.add(id);
          next[id] = value;
        });
        return next;
      });
    },
    [pageItems]
  );

  const selectRow = useCallback(
    (id: number, value: boolean, shiftKey: boolean) => {
      const anchor = lastToggled.current;
      lastToggled.current = id;
      explicitSelections.current.add(id);

      setSelectedState((previous) => {
        const next = { ...previous, [id]: value };
        const start = pageItems.findIndex((item) => item.id === anchor);
        const end = pageItems.findIndex((item) => item.id === id);

        if (shiftKey && start >= 0 && end >= 0) {
          pageItems
            .slice(Math.min(start, end), Math.max(start, end) + 1)
            .forEach((item) => {
              explicitSelections.current.add(item.id);
              next[item.id] = value;
            });
        }

        return next;
      });
    },
    [pageItems]
  );

  return { selectedState, selectPage, selectRow };
}
