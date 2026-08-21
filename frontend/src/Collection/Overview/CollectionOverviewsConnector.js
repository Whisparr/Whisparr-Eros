import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { useAppDimension } from 'App/appStore';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import CollectionOverviews from './CollectionOverviews';

function createMapStateToProps() {
  return createSelector(
    (state) => state.movieCollections.overviewOptions,
    createUISettingsSelector(),
    (overviewOptions, uiSettings) => {
      return {
        overviewOptions,
        showRelativeDates: uiSettings.showRelativeDates,
        shortDateFormat: uiSettings.shortDateFormat,
        longDateFormat: uiSettings.longDateFormat,
        timeFormat: uiSettings.timeFormat,
      };
    }
  );
}

const ConnectedCollectionOverviews = connect(createMapStateToProps)(
  CollectionOverviews
);

// Dimensions come from a zustand store now, which a selector cannot read, so a
// small function component subscribes and passes the breakpoint down as an own
// prop. `connect` forwards own props to the wrapped component untouched.
function CollectionOverviewsConnector(props) {
  const isSmallScreen = useAppDimension('isSmallScreen');

  return (
    <ConnectedCollectionOverviews {...props} isSmallScreen={isSmallScreen} />
  );
}

export default CollectionOverviewsConnector;
