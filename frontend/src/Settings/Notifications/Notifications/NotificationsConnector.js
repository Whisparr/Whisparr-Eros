import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import {
  deleteNotification,
  fetchNotifications,
} from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import { useTagList } from 'Tags/useTags';
import sortByProp from 'Utilities/Array/sortByProp';
import Notifications from './Notifications';

function createMapStateToProps() {
  return createSelector(
    createSortedSectionSelector('settings.notifications', sortByProp('name')),
    (notifications) => {
      return {
        ...notifications,
      };
    }
  );
}

const mapDispatchToProps = {
  fetchNotifications,
  deleteNotification,
};

class NotificationsList extends Component {
  //
  // Lifecycle

  componentDidMount() {
    this.props.fetchNotifications();
  }

  //
  // Listeners

  onConfirmDeleteNotification = (id) => {
    this.props.deleteNotification({ id });
  };

  //
  // Render

  render() {
    return (
      <Notifications
        {...this.props}
        onConfirmDeleteNotification={this.onConfirmDeleteNotification}
      />
    );
  }
}

NotificationsList.propTypes = {
  fetchNotifications: PropTypes.func.isRequired,
  deleteNotification: PropTypes.func.isRequired,
};

const ConnectedNotifications = connect(
  createMapStateToProps,
  mapDispatchToProps
)(NotificationsList);

// `tagList` arrives as an own prop from React Query; see DownloadClientsConnector.
export default function NotificationsConnector(props) {
  return <ConnectedNotifications {...props} tagList={useTagList()} />;
}
