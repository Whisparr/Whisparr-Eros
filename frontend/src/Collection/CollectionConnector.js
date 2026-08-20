import PropTypes from 'prop-types';
import React, { Component, useCallback } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import withScrollPosition from 'Components/withScrollPosition';
import { useCustomFiltersList } from 'Filters/useCustomFilters';
import {
  fetchMovieCollections,
  saveMovieCollections,
  setMovieCollectionsFilter,
  setMovieCollectionsSort,
} from 'Store/Actions/movieCollectionActions';
import scrollPositions from 'Store/scrollPositions';
import createCollectionClientSideCollectionItemsSelector from 'Store/Selectors/createCollectionClientSideCollectionItemsSelector';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import Collection from './Collection';

// `customFilters` arrives as an own prop from CollectionCustomFilters below,
// because it comes from React Query and this is still a connector. Own props
// reach every input selector as the second argument.
const selectCollectionItems =
  createCollectionClientSideCollectionItemsSelector('movieCollections');

function createMapStateToProps() {
  return createSelector(
    selectCollectionItems,
    createDimensionsSelector(),
    (collections, dimensionsState) => {
      return {
        ...collections,
        isSmallScreen: dimensionsState.isSmallScreen,
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    dispatchFetchMovieCollections() {
      dispatch(fetchMovieCollections());
    },
    onUpdateSelectedPress(payload) {
      dispatch(saveMovieCollections(payload));
    },
    onSortSelect(sortKey) {
      dispatch(setMovieCollectionsSort({ sortKey }));
    },
    onFilterSelect(selectedFilterKey) {
      dispatch(setMovieCollectionsFilter({ selectedFilterKey }));
    },
  };
}

class CollectionConnector extends Component {
  //
  // Lifecycle

  componentDidMount() {
    this.props.dispatchFetchMovieCollections();
  }

  //
  // Listeners

  onScroll = ({ scrollTop }) => {
    scrollPositions.movieCollections = scrollTop;
  };

  onUpdateSelectedPress = (payload) => {
    this.props.onUpdateSelectedPress(payload);
  };

  //
  // Render

  render() {
    const {
      dispatchFetchMovieCollections,
      ...otherProps
    } = this.props;

    return (
      <Collection
        {...otherProps}
        onViewSelect={this.onViewSelect}
        onScroll={this.onScroll}
        onUpdateSelectedPress={this.onUpdateSelectedPress}
      />
    );
  }
}

CollectionConnector.propTypes = {
  isSmallScreen: PropTypes.bool.isRequired,
  view: PropTypes.string.isRequired,
  onUpdateSelectedPress: PropTypes.func.isRequired,
  dispatchFetchMovieCollections: PropTypes.func.isRequired,
};

const ConnectedCollection = connect(
  createMapStateToProps,
  createMapDispatchToProps
)(CollectionConnector);

// Collection is still a class behind connect(), so custom filters and commands both
// have to arrive as own props.
function CollectionCustomFilters(props) {
  const customFilters = useCustomFiltersList('movieCollections');
  const executeCommand = useExecuteCommand();
  const isRefreshingCollections = useCommandExecuting(
    commandNames.REFRESH_COLLECTIONS
  );

  const onRefreshMovieCollectionsPress = useCallback(() => {
    executeCommand({ name: commandNames.REFRESH_COLLECTIONS });
  }, [executeCommand]);

  return (
    <ConnectedCollection
      {...props}
      customFilters={customFilters}
      isRefreshingCollections={isRefreshingCollections}
      onRefreshMovieCollectionsPress={onRefreshMovieCollectionsPress}
    />
  );
}

export default withScrollPosition(CollectionCustomFilters, 'movieCollections');
