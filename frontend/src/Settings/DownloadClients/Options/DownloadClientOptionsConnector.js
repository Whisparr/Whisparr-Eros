import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import withAdvancedSettings from 'Components/withAdvancedSettings';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import {
  fetchDownloadClientOptions,
  saveDownloadClientOptions,
  setDownloadClientOptionsValue,
} from 'Store/Actions/settingsActions';
import createSettingsSectionSelector from 'Store/Selectors/createSettingsSectionSelector';
import DownloadClientOptions from './DownloadClientOptions';

const SECTION = 'downloadClientOptions';

function createMapStateToProps() {
  return createSelector(
    createSettingsSectionSelector(SECTION),
    (sectionSettings) => {
      return {
        ...sectionSettings,
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchFetchDownloadClientOptions: fetchDownloadClientOptions,
  dispatchSetDownloadClientOptionsValue: setDownloadClientOptionsValue,
  dispatchSaveDownloadClientOptions: saveDownloadClientOptions,
  dispatchClearPendingChanges: clearPendingChanges,
};

class DownloadClientOptionsConnector extends Component {
  //
  // Lifecycle

  componentDidMount() {
    const {
      dispatchFetchDownloadClientOptions,
      dispatchSaveDownloadClientOptions,
      onChildMounted,
    } = this.props;

    dispatchFetchDownloadClientOptions();
    onChildMounted(dispatchSaveDownloadClientOptions);
  }

  componentDidUpdate(prevProps) {
    const { hasPendingChanges, isSaving, onChildStateChange } = this.props;

    if (
      prevProps.isSaving !== isSaving ||
      prevProps.hasPendingChanges !== hasPendingChanges
    ) {
      onChildStateChange({
        isSaving,
        hasPendingChanges,
      });
    }
  }

  componentWillUnmount() {
    this.props.dispatchClearPendingChanges({ section: `settings.${SECTION}` });
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.dispatchSetDownloadClientOptionsValue({ name, value });
  };

  //
  // Render

  render() {
    return (
      <DownloadClientOptions
        onInputChange={this.onInputChange}
        {...this.props}
      />
    );
  }
}

DownloadClientOptionsConnector.propTypes = {
  isSaving: PropTypes.bool.isRequired,
  hasPendingChanges: PropTypes.bool.isRequired,
  dispatchFetchDownloadClientOptions: PropTypes.func.isRequired,
  dispatchSetDownloadClientOptionsValue: PropTypes.func.isRequired,
  dispatchSaveDownloadClientOptions: PropTypes.func.isRequired,
  dispatchClearPendingChanges: PropTypes.func.isRequired,
  onChildMounted: PropTypes.func.isRequired,
  onChildStateChange: PropTypes.func.isRequired,
};

export default withAdvancedSettings(
  connect(
  createMapStateToProps,
  mapDispatchToProps
)(DownloadClientOptionsConnector)
);
