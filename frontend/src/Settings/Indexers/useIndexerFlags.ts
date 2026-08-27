import { useMemo } from 'react';
import useApiQuery from 'Helpers/Hooks/useApiQuery';
import IndexerFlag from 'typings/IndexerFlag';

const NO_INDEXER_FLAGS: IndexerFlag[] = [];

export const useIndexerFlags = () => {
  const result = useApiQuery<IndexerFlag[]>({
    path: '/indexerFlag',
    // The flags are compiled into the server -- they cannot change while the
    // app is running -- so they are fetched once for the session, the way the
    // slice they replace was fetched once by the boot gate.
    queryOptions: { staleTime: Infinity, gcTime: Infinity },
  });

  return {
    ...result,
    data: result.data ?? NO_INDEXER_FLAGS,
  };
};

// A release's flags arrive as one bitmask, so both callers -- the movie detail
// list and the select input -- have to unpack it against the flag list before
// they can show anything. The unpacking was duplicated in a selector on each
// side; it lives here now, next to the query it needs.
export const useSelectedIndexerFlags = (selectedFlags: number) => {
  const { data, ...result } = useIndexerFlags();

  const flags = useMemo(() => {
    // eslint-disable-next-line no-bitwise
    return data.filter(({ id }) => (selectedFlags & id) === id);
  }, [data, selectedFlags]);

  return {
    ...result,
    data: flags,
  };
};
