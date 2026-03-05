import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as commandNames from 'Commands/commandNames';
import Column from 'Components/Table/Column';
import withCurrentPage from 'Components/withCurrentPage';
import { executeCommand } from 'Store/Actions/commandActions';
import {
  deleteMovieFile,
  deleteMovieFiles,
} from 'Store/Actions/movieFileActions';
import { setUnmappedMovieFilesTableOption } from 'Store/Actions/unmappedMovieFileActions';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import {
  registerPagePopulator,
  unregisterPagePopulator,
} from 'Utilities/pagePopulator';
import { useUnmappedMovieFiles } from '../MovieFile/useMovieFile';
import UnmappedFilesTable from './UnmappedFilesTable';

function UnmappedFilesTableConnector() {
  const dispatch = useDispatch();
  const {
    data: items = [],
    isLoading,
    isSuccess,
    refetch,
  } = useUnmappedMovieFiles();
  const movieFileColumns = useSelector(
    (state: { unmappedMovieFiles: { columns: Column[] } }) =>
      state.unmappedMovieFiles || { columns: [] as Column[] }
  );
  const isScanningFolders = useSelector(
    createCommandExecutingSelector(commandNames.RESCAN_SCENES)
  );
  const isCleaningUnmappedFiles = useSelector(
    createCommandExecutingSelector(commandNames.CLEAN_UNMAPPED_FILES)
  );

  React.useEffect(() => {
    registerPagePopulator(refetch);
    return () => unregisterPagePopulator(refetch);
  }, [refetch]);

  React.useEffect(() => {
    // When scan completes, refetch unmapped files
    if (!isScanningFolders) {
      refetch();
    }
    // Only run when isScanningFolders changes
  }, [isScanningFolders, refetch]);

  // Stable callbacks for props
  const handleDeleteUnmappedFile = React.useCallback(
    (id: number) => {
      dispatch(deleteMovieFile(id));
    },
    [dispatch]
  );
  const handleDeleteUnmappedFiles = React.useCallback(
    (ids: number[]) => {
      dispatch(deleteMovieFiles(ids));
    },
    [dispatch]
  );
  const handleTableOptionChange = React.useCallback(
    (payload: unknown) => {
      dispatch(setUnmappedMovieFilesTableOption(payload));
    },
    [dispatch]
  );
  const handleAddScenesPress = React.useCallback(() => {
    dispatch(executeCommand({ name: commandNames.RESCAN_SCENES }));
  }, [dispatch]);
  const handleCleanUnmappedFilesPress = React.useCallback(() => {
    dispatch(executeCommand({ name: commandNames.CLEAN_UNMAPPED_FILES }));
  }, [dispatch]);

  const isPopulated = isSuccess;
  const isDeleting = false;
  const fetchUnmappedFiles = React.useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <UnmappedFilesTable
      items={items}
      columns={movieFileColumns.columns}
      isFetching={isLoading}
      isScanningFolders={isScanningFolders}
      isCleaningUnmappedFiles={isCleaningUnmappedFiles}
      isPopulated={isPopulated}
      isDeleting={isDeleting}
      fetchUnmappedFiles={fetchUnmappedFiles}
      deleteUnmappedFile={handleDeleteUnmappedFile}
      deleteUnmappedFiles={handleDeleteUnmappedFiles}
      onTableOptionChange={handleTableOptionChange}
      onAddScenesPress={handleAddScenesPress}
      onCleanUnmappedFilesPress={handleCleanUnmappedFilesPress}
    />
  );
}

export default withCurrentPage(UnmappedFilesTableConnector);
