import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as commandNames from 'Commands/commandNames';
import withCurrentPage from 'Components/withCurrentPage';
import { executeCommand } from 'Store/Actions/commandActions';
import {
  deleteMovieFile,
  deleteMovieFiles,
} from 'Store/Actions/movieFileActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import { TableOptionsChangePayload } from 'typings/Table';
import {
  registerPagePopulator,
  unregisterPagePopulator,
} from 'Utilities/pagePopulator';
import { useUnmappedMovieFiles } from '../MovieFile/useMovieFile';
import {
  setUnmappedFilesOptions,
  setUnmappedFilesSort,
  useUnmappedFilesOptions,
} from './unmappedFilesOptionsStore';
import UnmappedFilesTable from './UnmappedFilesTable';

function UnmappedFilesTableConnector() {
  const dispatch = useDispatch();
  const {
    data: items = [],
    isLoading,
    isSuccess,
    refetch,
  } = useUnmappedMovieFiles();
  const { columns, sortKey, sortDirection } = useUnmappedFilesOptions();
  const isScanningFolders = useSelector(
    createCommandExecutingSelector(commandNames.RESCAN_SCENES)
  );
  const isCleaningUnmappedFiles = useSelector(
    createCommandExecutingSelector(commandNames.CLEAN_UNMAPPED_FILES)
  );

  useEffect(() => {
    registerPagePopulator(refetch);
    return () => unregisterPagePopulator(refetch);
  }, [refetch]);

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
    dispatch(executeCommand({ name: commandNames.RESCAN_SCENES }));
  }, [dispatch]);
  const handleCleanUnmappedFilesPress = useCallback(() => {
    dispatch(executeCommand({ name: commandNames.CLEAN_UNMAPPED_FILES }));
  }, [dispatch]);

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
