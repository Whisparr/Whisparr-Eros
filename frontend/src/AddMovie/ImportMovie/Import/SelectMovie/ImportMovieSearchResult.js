import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from 'Components/Link/Link';
import ImportMovieTitle from './ImportMovieTitle';
import styles from './ImportMovieSearchResult.css';

class ImportMovieSearchResult extends Component {

  //
  // Listeners

  onPress = () => {
    this.props.onPress(this.props.foreignId);
  };

  //
  // Render

  render() {
    const {
      itemType,
      title,
      year,
      releaseDate,
      studioTitle,
      isExistingMovie
    } = this.props;

    return (
      <div className={styles.container}>
        <Link
          className={styles.movie}
          onPress={this.onPress}
        >
          <ImportMovieTitle
            itemType={itemType}
            title={title}
            year={year}
            releaseDate={releaseDate}
            studioTitle={studioTitle}
            isExistingMovie={isExistingMovie}
          />
        </Link>

      </div>
    );
  }
}

ImportMovieSearchResult.propTypes = {
  foreignId: PropTypes.string,
  itemType: PropTypes.string,
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  releaseDate: PropTypes.string,
  studioTitle: PropTypes.string,
  isExistingMovie: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired
};

export default ImportMovieSearchResult;
