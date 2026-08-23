import React, { useCallback, useEffect } from 'react';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import withCurrentPage from 'Components/withCurrentPage';
import { TableOptionsChangePayload } from 'typings/Table';
import {
  useDeleteMovieFile,
  useDeleteMovieFiles,
  useUnmappedMovieFiles,
} from '../MovieFile/useMovieFile';
import {
  setUnmappedFilesOptions,
  setUnmappedFilesSort,
  useUnmappedFilesOptions,
} from './unmappedFilesOptionsStore';
import UnmappedFilesTable from './UnmappedFilesTable';

function UnmappedFilesTableConnector() {
  const executeCommand = useExecuteCommand();
  const {
    data: items = [],
    isLoading,
    isSuccess,
    refetch,
  } = useUnmappedMovieFiles();
  const { columns, sortKey, sortDirection } = useUnmappedFilesOptions();
  const {
    mutate: deleteMovieFile,
    isPending: isDeletingFile,
    error: deleteFileError,
  } = useDeleteMovieFile();
  const {
    mutate: deleteMovieFiles,
    isPending: isDeletingFiles,
    error: deleteFilesError,
  } = useDeleteMovieFiles();
  const isScanningFolders = useCommandExecuting(commandNames.RESCAN_SCENES);
  const isCleaningUnmappedFiles = useCommandExecuting(
    commandNames.CLEAN_UNMAPPED_FILES
  );

  useEffect(() => {
    // When scan completes, refetch unmapped files
    if (!isScanningFolders) {
      refetch();
    }
    // Only run when isScanningFolders changes
  }, [isScanningFolders, refetch]);

  // Stable callbacks for props
  const handleDeleteUnmappedFile = useCallback(
    (id: number) => {
      deleteMovieFile({ id });
    },
    [deleteMovieFile]
  );
  const handleDeleteUnmappedFiles = useCallback(
    (movieFileIds: number[]) => {
      deleteMovieFiles({ movieFileIds });
    },
    [deleteMovieFiles]
  );
  const handleTableOptionChange = useCallback(
    (payload: TableOptionsChangePayload) => {
      setUnmappedFilesOptions(payload);
    },
    []
  );
  const handleSortPress = useCallback((sortKey: string) => {
    setUnmappedFilesSort({ sortKey });
  }, []);
  const handleAddScenesPress = useCallback(() => {
    executeCommand({ name: commandNames.RESCAN_SCENES });
  }, [executeCommand]);
  const handleCleanUnmappedFilesPress = useCallback(() => {
    executeCommand({ name: commandNames.CLEAN_UNMAPPED_FILES });
  }, [executeCommand]);

  const isPopulated = isSuccess;
  // The table deselects its rows once a delete finishes cleanly, so it needs
  // both halves: `isDeleting` was hardcoded false, which left the spinner dead
  // and that branch unreachable.
  const isDeleting = isDeletingFile || isDeletingFiles;
  const deleteError = deleteFileError ?? deleteFilesError ?? undefined;
  const fetchUnmappedFiles = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <UnmappedFilesTable
      items={items}
      columns={columns}
      sortKey={sortKey}
      sortDirection={sortDirection}
      isFetching={isLoading}
      isScanningFolders={isScanningFolders}
      isCleaningUnmappedFiles={isCleaningUnmappedFiles}
      isPopulated={isPopulated}
      isDeleting={isDeleting}
      deleteError={deleteError}
      fetchUnmappedFiles={fetchUnmappedFiles}
      deleteUnmappedFile={handleDeleteUnmappedFile}
      deleteUnmappedFiles={handleDeleteUnmappedFiles}
      onSortPress={handleSortPress}
      onTableOptionChange={handleTableOptionChange}
      onAddScenesPress={handleAddScenesPress}
      onCleanUnmappedFilesPress={handleCleanUnmappedFilesPress}
    />
  );
}

export default withCurrentPage(UnmappedFilesTableConnector);
