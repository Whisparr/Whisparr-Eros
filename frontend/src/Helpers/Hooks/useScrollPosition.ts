import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { OnScroll } from 'Components/Scroller/Scroller';
import scrollPositions from 'Helpers/scrollPositions';

function useScrollPosition(key?: string) {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  // On small screens the window is the scroll container, not the page body,
  // so nothing resets it when a route changes. Reset it on PUSH/REPLACE and
  // leave it alone on POP, which is where the stored position gets restored.
  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  const initialScrollTop = useMemo(
    () => (key && navigationType === 'POP' ? (scrollPositions[key] ?? 0) : 0),
    [key, navigationType]
  );

  const onScroll = useCallback(
    ({ scrollTop }: OnScroll) => {
      if (key) {
        scrollPositions[key] = scrollTop;
      }
    },
    [key]
  );

  return { initialScrollTop, onScroll };
}

export default useScrollPosition;
