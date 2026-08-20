import React, { useCallback } from 'react';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import LogFiles from '../LogFiles';
import { useUpdateLogFiles } from '../useLogFiles';

function UpdateLogFiles() {
  const executeCommand = useExecuteCommand();
  const { data = [], isFetching, refetch } = useUpdateLogFiles();

  const isDeleteFilesExecuting = useCommandExecuting(
    commandNames.DELETE_UPDATE_LOG_FILES
  );

  const handleRefreshPress = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleDeleteFilesPress = useCallback(() => {
    executeCommand({
      name: commandNames.DELETE_UPDATE_LOG_FILES,
      commandFinished: () => {
        refetch();
      },
    });
  }, [refetch, executeCommand]);

  return (
    <LogFiles
      isDeleteFilesExecuting={isDeleteFilesExecuting}
      isFetching={isFetching}
      items={data}
      type="update"
      onRefreshPress={handleRefreshPress}
      onDeleteFilesPress={handleDeleteFilesPress}
    />
  );
}

export default UpdateLogFiles;
