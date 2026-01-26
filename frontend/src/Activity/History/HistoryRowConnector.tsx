import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchHistory, markAsFailed } from '../../Store/Actions/historyActions';
import createMovieSelector from '../../Store/Selectors/createMovieSelector';
import createUISettingsSelector from '../../Store/Selectors/createUISettingsSelector';
import HistoryRow, { HistoryRowProps } from './HistoryRow';

interface UISettings {
  shortDateFormat: string;
  timeFormat: string;
}

function createMapStateToProps() {
  return createSelector(
    createMovieSelector(),
    createUISettingsSelector(),
    (movie: unknown, uiSettings: UISettings) => {
      return {
        movie,
        shortDateFormat: uiSettings.shortDateFormat,
        timeFormat: uiSettings.timeFormat,
      };
    }
  );
}

const mapDispatchToProps = {
  fetchHistory,
  markAsFailed,
};

type HistoryRowConnectorProps = Omit<HistoryRowProps, 'onMarkAsFailedPress'> & {
  fetchHistory: () => void;
  markAsFailed: (payload: { id: number }) => void;
};

class HistoryRowConnector extends Component<HistoryRowConnectorProps> {
  componentDidUpdate(prevProps: HistoryRowConnectorProps) {
    if (
      prevProps.isMarkingAsFailed &&
      !this.props.isMarkingAsFailed &&
      !this.props.markAsFailedError
    ) {
      this.props.fetchHistory();
    }
  }

  onMarkAsFailedPress = () => {
    this.props.markAsFailed({ id: this.props.id });
  };

  render() {
    return (
      <HistoryRow
        {...(this.props as Omit<HistoryRowProps, 'onMarkAsFailedPress'>)}
        onMarkAsFailedPress={this.onMarkAsFailedPress}
      />
    );
  }
}

export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(HistoryRowConnector);
