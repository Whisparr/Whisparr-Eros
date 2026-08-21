import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useAppDimension } from 'App/appStore';
import { toggleCollectionMonitored } from 'Store/Actions/movieCollectionActions';
import CollectionOverview from './CollectionOverview';

const mapDispatchToProps = {
  toggleCollectionMonitored,
};

class CollectionOverviewBase extends Component {
  //
  // Listeners

  onMonitorTogglePress = (monitored) => {
    this.props.toggleCollectionMonitored({
      collectionId: this.props.collectionId,
      monitored,
    });
  };

  //
  // Render

  render() {
    return (
      <CollectionOverview
        {...this.props}
        onMonitorTogglePress={this.onMonitorTogglePress}
      />
    );
  }
}

CollectionOverviewBase.propTypes = {
  collectionId: PropTypes.number.isRequired,
  monitored: PropTypes.bool.isRequired,
  toggleCollectionMonitored: PropTypes.func.isRequired,
};

const ConnectedCollectionOverview = connect(
  null,
  mapDispatchToProps
)(CollectionOverviewBase);

// Dimensions come from a zustand store now, which a selector cannot read, so a
// small function component subscribes and passes the breakpoint down as an own
// prop. `connect` forwards own props to the wrapped component untouched.
function CollectionOverviewConnector(props) {
  const isSmallScreen = useAppDimension('isSmallScreen');

  return <ConnectedCollectionOverview {...props} isSmallScreen={isSmallScreen} />;
}

export default CollectionOverviewConnector;
