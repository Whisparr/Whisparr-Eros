import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import AppState, { CustomFilter } from 'App/State/AppState';
import HistoryAppState from 'App/State/HistoryAppState';
import MoviesAppState from 'App/State/MoviesAppState';
import { TableOptionsChangePayload } from 'typings/Table';
import withCurrentPage from '../../Components/withCurrentPage';
import * as historyActions from '../../Store/Actions/historyActions';
import { createCustomFiltersSelector } from '../../Store/Selectors/createClientSideCollectionSelector';
import {
  registerPagePopulator,
  unregisterPagePopulator,
} from '../../Utilities/pagePopulator';
import History from './History';

interface StateProps {
  isMoviesFetching: boolean;
  isMoviesPopulated: boolean;
  moviesError: unknown;
  customFilters: CustomFilter[];
  useCurrentPage: boolean;
  items: unknown[];
  [key: string]: unknown;
}

function createMapStateToProps() {
  return createSelector(
    (state: AppState) => state.history as HistoryAppState,
    (state: AppState) => state.movies as MoviesAppState,
    createCustomFiltersSelector('history'),
    (history, movies, customFilters): StateProps => {
      return {
        isMoviesFetching: movies.isFetching,
        isMoviesPopulated: movies.isPopulated,
        moviesError: movies.error,
        customFilters,
        ...history,
      };
    }
  );
}

const mapDispatchToProps = {
  ...historyActions,
};

interface HistoryConnectorProps extends StateProps {
  fetchHistory: () => void;
  gotoHistoryFirstPage: () => void;
  gotoHistoryPreviousPage: () => void;
  gotoHistoryNextPage: () => void;
  gotoHistoryLastPage: () => void;
  gotoHistoryPage: (payload: { page: number }) => void;
  setHistorySort: (payload: { sortKey: string }) => void;
  setHistoryFilter: (payload: { selectedFilterKey: string }) => void;
  setHistoryTableOption: (payload: TableOptionsChangePayload) => void;
  clearHistory: () => void;
}

class HistoryConnector extends Component<HistoryConnectorProps> {
  componentDidMount() {
    const { useCurrentPage, fetchHistory, gotoHistoryFirstPage } = this.props;

    registerPagePopulator(this.repopulate);

    if (useCurrentPage) {
      fetchHistory();
    } else {
      gotoHistoryFirstPage();
    }
  }

  componentWillUnmount() {
    unregisterPagePopulator(this.repopulate);
    this.props.clearHistory();
  }

  repopulate = () => {
    this.props.fetchHistory();
  };

  handleFirstPagePress = () => {
    this.props.gotoHistoryFirstPage();
  };

  handlePreviousPagePress = () => {
    this.props.gotoHistoryPreviousPage();
  };

  handleNextPagePress = () => {
    this.props.gotoHistoryNextPage();
  };

  handleLastPagePress = () => {
    this.props.gotoHistoryLastPage();
  };

  handlePageSelect = (page: number) => {
    this.props.gotoHistoryPage({ page });
  };

  handleSortPress = (sortKey: string) => {
    this.props.setHistorySort({ sortKey });
  };

  handleFilterSelect = (selectedFilterKey: string | number) => {
    this.props.setHistoryFilter({
      selectedFilterKey: String(selectedFilterKey),
    });
  };

  handleTableOptionChange = (payload: TableOptionsChangePayload) => {
    this.props.setHistoryTableOption(payload);
    if ((payload as { pageSize?: number }).pageSize) {
      this.props.gotoHistoryFirstPage();
    }
  };

  render() {
    return (
      <History
        handleFirstPagePress={this.handleFirstPagePress}
        handlePreviousPagePress={this.handlePreviousPagePress}
        handleNextPagePress={this.handleNextPagePress}
        handleLastPagePress={this.handleLastPagePress}
        handlePageSelect={this.handlePageSelect}
        handleSortPress={this.handleSortPress}
        handleFilterSelect={this.handleFilterSelect}
        handleTableOptionChange={this.handleTableOptionChange}
        {...this.props}
      />
    );
  }
}

export default withCurrentPage(
  connect(createMapStateToProps, mapDispatchToProps)(HistoryConnector)
);
