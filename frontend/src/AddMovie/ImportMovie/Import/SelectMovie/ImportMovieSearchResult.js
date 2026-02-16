import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
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
      foreignId,
      tmdbId,
      tpdbId,
      itemType,
      title,
      year,
      releaseDate,
      studioTitle,
      isExistingMovie
    } = this.props;

    const stashId = (foreignId && tmdbId === 0 && !tpdbId) ? foreignId : '';

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

        {!!tmdbId && (
          <Link
            className={styles.tmdbLink}
            to={`https://www.themoviedb.org/movie/${tmdbId}`}
          >
            <Icon
              className={styles.tmdbLinkIcon}
              name={icons.EXTERNAL_LINK}
              size={16}
            />
          </Link>
        )}

        {!!tpdbId && (
          <Link
            className={styles.tpdbLink}
            to={`https://theporndb.net/movies/${tpdbId}`}
          >
            <Icon
              className={styles.tpdbLinkIcon}
              name={icons.EXTERNAL_LINK}
              size={16}
            />
          </Link>
        )}

        {!!stashId && stashId !== tmdbId?.toString() && (
          <Link
            className={styles.stashdbLink}
            to={`https://stashdb.org/scenes/${stashId}/`}
          >
            <Icon
              className={styles.stashdbLinkIcon}
              name={icons.EXTERNAL_LINK}
              size={16}
            />
          </Link>
        )}
      </div>
    );
  }
}

ImportMovieSearchResult.propTypes = {
  foreignId: PropTypes.string,
  tmdbId: PropTypes.number,
  tpdbId: PropTypes.string,
  itemType: PropTypes.string,
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  releaseDate: PropTypes.string,
  studioTitle: PropTypes.string,
  isExistingMovie: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired
};

export default ImportMovieSearchResult;
