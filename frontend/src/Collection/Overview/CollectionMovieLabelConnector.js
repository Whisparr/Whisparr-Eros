import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { useAppDimension } from 'App/appStore';
import { toggleMovieMonitored } from 'Store/Actions/movieActions';
import createCollectionExistingMovieSelector from 'Store/Selectors/createCollectionExistingMovieSelector';
import CollectionMovieLabel from './CollectionMovieLabel';

function createMapStateToProps() {
  return createSelector(
    createCollectionExistingMovieSelector(),
    (existingMovie) => {
      return {
        isExistingMovie: !!existingMovie,
        ...existingMovie,
      };
    }
  );
}

const mapDispatchToProps = {
  toggleMovieMonitored,
};

class CollectionMovieLabelBase extends Component {
  //
  // Listeners

  onMonitorTogglePress = (monitored) => {
    this.props.toggleMovieMonitored({
      movieId: this.props.id,
      monitored,
    });
  };

  //
  // Render

  render() {
    return (
      <CollectionMovieLabel
        {...this.props}
        onMonitorTogglePress={this.onMonitorTogglePress}
      />
    );
  }
}

CollectionMovieLabelBase.propTypes = {
  id: PropTypes.number,
  monitored: PropTypes.bool,
  toggleMovieMonitored: PropTypes.func.isRequired,
};

const ConnectedCollectionMovieLabel = connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionMovieLabelBase);

// Dimensions come from a zustand store now, which a selector cannot read, so a
// small function component subscribes and passes the breakpoint down as an own
// prop. `connect` forwards own props to the wrapped component untouched.
function CollectionMovieLabelConnector(props) {
  const isSmallScreen = useAppDimension('isSmallScreen');

  return <ConnectedCollectionMovieLabel {...props} isSmallScreen={isSmallScreen} />;
}

export default CollectionMovieLabelConnector;
