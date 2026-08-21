import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { useAppDimension } from 'App/appStore';
import { toggleMovieMonitored } from 'Store/Actions/movieActions';
import createCollectionExistingMovieSelector from 'Store/Selectors/createCollectionExistingMovieSelector';
import CollectionMovie from './CollectionMovie';

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

class CollectionMovieBase extends Component {
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
      <CollectionMovie
        {...this.props}
        onMonitorTogglePress={this.onMonitorTogglePress}
      />
    );
  }
}

CollectionMovieBase.propTypes = {
  id: PropTypes.number,
  monitored: PropTypes.bool,
  toggleMovieMonitored: PropTypes.func.isRequired,
};

const ConnectedCollectionMovie = connect(
  createMapStateToProps,
  mapDispatchToProps
)(CollectionMovieBase);

// Dimensions come from a zustand store now, which a selector cannot read, so a
// small function component subscribes and passes the breakpoint down as an own
// prop. `connect` forwards own props to the wrapped component untouched.
function CollectionMovieConnector(props) {
  const isSmallScreen = useAppDimension('isSmallScreen');

  return <ConnectedCollectionMovie {...props} isSmallScreen={isSmallScreen} />;
}

export default CollectionMovieConnector;
