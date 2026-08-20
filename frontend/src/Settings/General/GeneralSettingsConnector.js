import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import { useCommandExecuting, useExecuteCommand } from 'Commands/useCommands';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import {
  fetchGeneralSettings,
  saveGeneralSettings,
  setGeneralSettingsValue,
} from 'Store/Actions/settingsActions';
import { restart } from 'Store/Actions/systemActions';
import createSettingsSectionSelector from 'Store/Selectors/createSettingsSectionSelector';
import { useIsWindowsService } from 'System/Status/useSystemStatus';
import GeneralSettings from './GeneralSettings';

const SECTION = 'general';

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.advancedSettings,
    createSettingsSectionSelector(SECTION),
    (advancedSettings, sectionSettings, isResettingApiKey) => {
      return {
        advancedSettings,
        isResettingApiKey,
        ...sectionSettings,
      };
    }
  );
}

const mapDispatchToProps = {
  setGeneralSettingsValue,
  saveGeneralSettings,
  fetchGeneralSettings,
  restart,
  clearPendingChanges,
};

class GeneralSettingsHandlers extends Component {
  //
  // Lifecycle

  componentDidMount() {
    this.props.fetchGeneralSettings();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.isResettingApiKey && prevProps.isResettingApiKey) {
      this.props.fetchGeneralSettings();
    }
  }

  componentWillUnmount() {
    this.props.clearPendingChanges({ section: `settings.${SECTION}` });
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.setGeneralSettingsValue({ name, value });
  };

  onSavePress = () => {
    this.props.saveGeneralSettings();
  };

  onConfirmResetApiKey = () => {
    this.props.executeCommand({ name: commandNames.RESET_API_KEY });
  };

  onConfirmRestart = () => {
    this.props.restart();
  };

  //
  // Render

  render() {
    return (
      <GeneralSettings
        onInputChange={this.onInputChange}
        onSavePress={this.onSavePress}
        onConfirmResetApiKey={this.onConfirmResetApiKey}
        onConfirmRestart={this.onConfirmRestart}
        {...this.props}
      />
    );
  }
}

GeneralSettingsHandlers.propTypes = {
  isResettingApiKey: PropTypes.bool.isRequired,
  executeCommand: PropTypes.func.isRequired,
  setGeneralSettingsValue: PropTypes.func.isRequired,
  saveGeneralSettings: PropTypes.func.isRequired,
  fetchGeneralSettings: PropTypes.func.isRequired,
  restart: PropTypes.func.isRequired,
  clearPendingChanges: PropTypes.func.isRequired,
};

const ConnectedGeneralSettings = connect(
  createMapStateToProps,
  mapDispatchToProps
)(GeneralSettingsHandlers);

// GeneralSettings is still a class component and connect() cannot call hooks,
// so neither can read system status from React Query directly. This bridges the
// one value they need until General settings converts in Phase E; the other
// three status props now go straight to HostSettings and UpdateSettings, which
// are function components and read the query themselves.
export default function GeneralSettingsConnector() {
  const isWindowsService = useIsWindowsService();
  const executeCommand = useExecuteCommand();
  const isResettingApiKey = useCommandExecuting(commandNames.RESET_API_KEY);

  return (
    <ConnectedGeneralSettings
      isWindowsService={isWindowsService}
      isResettingApiKey={isResettingApiKey}
      executeCommand={executeCommand}
    />
  );
}
