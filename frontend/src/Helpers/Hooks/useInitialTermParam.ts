import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import parseUrl from 'Utilities/String/parseUrl';

// The `?term=` an add page was opened with, read once so later URL changes
// don't overwrite what the user has typed since.
function useInitialTermParam() {
  const location = useLocation();

  return useMemo(() => {
    const { term } = parseUrl(location.search).params;

    return typeof term === 'string' ? term : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useInitialTermParam;
