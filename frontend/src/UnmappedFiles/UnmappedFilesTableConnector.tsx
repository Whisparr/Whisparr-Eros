import React, { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import withCurrentPage from 'Components/withCurrentPage';
import {
  deleteMovieFile,
  deleteMovieFiles,
} from 'Store/Actions/movieFileActions';
import { TableOptionsChangePayload } from 'typings/Table';
import { useUnmappedMovieFiles } from '../MovieFile/useMovieFile';
import {
  setUnmappedFilesOptions,
  setUnmappedFilesSort,
  useUnmappedFilesOptions,
} from './unmappedFilesOptionsStore';
import UnmappedFilesTable from './UnmappedFilesTable';

function UnmappedFilesTableConnector() {
  const dispatch = useDispatch();
  const executeCommand = useExecuteCommand();
  const {
    data: items = [],
    isLoading,
    isSuccess,
    refetch,
  } = useUnmappedMovieFiles();
  const { columns, sortKey, sortDirection } = useUnmappedFilesOptions();
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
      dispatch(deleteMovieFile(id));
    },
    [dispatch]
  );
  const handleDeleteUnmappedFiles = useCallback(
    (ids: number[]) => {
      dispatch(deleteMovieFiles(ids));
    },
    [dispatch]
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
  const isDeleting = false;
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
