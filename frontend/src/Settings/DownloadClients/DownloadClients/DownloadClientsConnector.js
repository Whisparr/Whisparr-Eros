import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  deleteDownloadClient,
  fetchDownloadClients,
} from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import { useTagList } from 'Tags/useTags';
import sortByProp from 'Utilities/Array/sortByProp';
import DownloadClients from './DownloadClients';

function createMapStateToProps() {
  return createSelector(
    createSortedSectionSelector('settings.downloadClients', sortByProp('name')),
    (downloadClients) => {
      return {
        ...downloadClients,
      };
    }
  );
}

const mapDispatchToProps = {
  fetchDownloadClients,
  deleteDownloadClient,
};

class DownloadClientsList extends Component {
  //
  // Lifecycle

  componentDidMount() {
    this.props.fetchDownloadClients();
  }

  //
  // Listeners

  onConfirmDeleteDownloadClient = (id) => {
    this.props.deleteDownloadClient({ id });
  };

  //
  // Render

  render() {
    return (
      <DownloadClients
        {...this.props}
        onConfirmDeleteDownloadClient={this.onConfirmDeleteDownloadClient}
      />
    );
  }
}

DownloadClientsList.propTypes = {
  fetchDownloadClients: PropTypes.func.isRequired,
  deleteDownloadClient: PropTypes.func.isRequired,
};

const ConnectedDownloadClients = connect(
  createMapStateToProps,
  mapDispatchToProps
)(DownloadClientsList);

// `tagList` comes from React Query now, so it can only enter a connector from
// the outside. connect() merges own props in for free, and the connector
// already spreads its props into DownloadClients.
export default function DownloadClientsConnector(props) {
  return <ConnectedDownloadClients {...props} tagList={useTagList()} />;
}
