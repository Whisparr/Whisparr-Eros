import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import UiSettings from 'typings/Settings/UiSettings';
import HistoryDetails from './HistoryDetails';

function createMapStateToProps() {
  return createSelector(
    createUISettingsSelector(),
    (uiSettings: UiSettings) => {
      return {
        shortDateFormat: uiSettings.shortDateFormat,
        timeFormat: uiSettings.timeFormat,
      };
    }
  );
}

export default connect(createMapStateToProps)(HistoryDetails);
