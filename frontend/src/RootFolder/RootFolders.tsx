import React from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Column from 'Components/Table/Column';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import RootFolderRow from './RootFolderRow';
import useRootFolders, { useSortedRootFolders } from './useRootFolders';

const rootFolderColumns: Column[] = [
  {
    name: 'path',
    label: () => translate('Path'),
    isVisible: true,
  },
  {
    name: 'freeSpace',
    label: () => translate('FreeSpace'),
    isVisible: true,
  },
  {
    name: 'importFiles',
    label: () => translate('ImportFiles'),
    isVisible: true,
  },
  {
    name: 'actions',
    label: '',
    isVisible: true,
  },
];

function RootFolders() {
  const { isFetching, isFetched, error } = useRootFolders();
  const rootFolders = useSortedRootFolders();

  if (isFetching && !isFetched) {
    return <LoadingIndicator />;
  }

  if (!isFetching && !!error) {
    return (
      <Alert kind={kinds.DANGER}>{translate('RootFoldersLoadError')}</Alert>
    );
  }

  return (
    <Table columns={rootFolderColumns}>
      <TableBody>
        {rootFolders.map((rootFolder) => {
          return (
            <RootFolderRow
              key={rootFolder.id}
              id={rootFolder.id}
              path={rootFolder.path}
              accessible={rootFolder.accessible}
              freeSpace={rootFolder.freeSpace}
              importFiles={rootFolder.importFiles}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}

export default RootFolders;
