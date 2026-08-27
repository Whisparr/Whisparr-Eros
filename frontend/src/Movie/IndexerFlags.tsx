import React from 'react';
import { useSelectedIndexerFlags } from 'Settings/Indexers/useIndexerFlags';

interface IndexerFlagsProps {
  indexerFlags: number;
}

function IndexerFlags({ indexerFlags = 0 }: Readonly<IndexerFlagsProps>) {
  const { data: flags } = useSelectedIndexerFlags(indexerFlags);

  return flags.length ? (
    <ul>
      {flags.map((flag) => {
        return <li key={flag.id}>{flag.name}</li>;
      })}
    </ul>
  ) : null;
}

export default IndexerFlags;
