import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import withCurrentPage from 'Components/withCurrentPage';
import { executeCommand } from 'Store/Actions/commandActions';
import {
  deleteMovieFile,
  deleteMovieFiles,
  fetchMovieFiles,
} from 'Store/Actions/movieFileActions';
import { setUnmappedMovieFilesTableOption } from 'Store/Actions/unmappedMovieFileActions';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import {
  registerPagePopulator,
  unregisterPagePopulator,
} from 'Utilities/pagePopulator';
import UnmappedFilesTable, {
  UnmappedFilesTableProps,
} from './UnmappedFilesTable';

// TODO: Add proper types for state, dispatch, and props
function createMapStateToProps() {
  return createSelector(
    createClientSideCollectionSelector('movieFiles'),
    createClientSideCollectionSelector('movieFiles', 'unmappedMovieFiles'),
    createCommandExecutingSelector(commandNames.RESCAN_SCENES),
    createCommandExecutingSelector(commandNames.CLEAN_UNMAPPED_FILES),
    createDimensionsSelector(),
    (
      movieFiles,
      movieFileColumns,
      isScanningFolders,
      isCleaningUnmappedFiles,
      dimensionsState
    ) => {
      const { items, ...otherProps } = movieFiles;
      const unmappedFiles = _.filter(items, { movieId: 0 });
      return {
        ...otherProps,
        items: unmappedFiles,
        columns: movieFileColumns.columns,
        isScanningFolders,
        isCleaningUnmappedFiles,
        isSmallScreen: dimensionsState.isSmallScreen,
      };
    }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createMapDispatchToProps(dispatch: any) {
  return {
    onTableOptionChange(payload: unknown) {
      dispatch(setUnmappedMovieFilesTableOption(payload));
    },
    fetchUnmappedFiles() {
      dispatch(fetchMovieFiles({ unmapped: true }));
    },
    deleteUnmappedFile(id: number) {
      dispatch(deleteMovieFile(id));
    },
    deleteUnmappedFiles(ids: number[]) {
      dispatch(deleteMovieFiles(ids));
    },
    onAddScenesPress() {
      dispatch(executeCommand({ name: commandNames.RESCAN_SCENES }));
    },
    onCleanUnmappedFilesPress() {
      dispatch(executeCommand({ name: commandNames.CLEAN_UNMAPPED_FILES }));
    },
  };
}

class UnmappedFilesTableConnector extends Component<UnmappedFilesTableProps> {
  componentDidMount() {
    if (
      !this.props.isPopulated &&
      (!this.props.items || this.props.items.length === 0)
    ) {
      this.props.fetchUnmappedFiles();
    }
    registerPagePopulator(this.props.fetchUnmappedFiles);
  }
  componentWillUnmount() {
    unregisterPagePopulator(this.props.fetchUnmappedFiles);
  }
  render() {
    return <UnmappedFilesTable {...this.props} />;
  }
}

export default withCurrentPage(
  connect(
    createMapStateToProps,
    createMapDispatchToProps
  )(UnmappedFilesTableConnector)
);
