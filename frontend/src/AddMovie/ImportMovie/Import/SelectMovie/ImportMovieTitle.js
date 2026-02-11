import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Label from 'Components/Label';
import { kinds } from 'Helpers/Props';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import getRelativeDate from 'Utilities/Date/getRelativeDate';
import translate from 'Utilities/String/translate';
import styles from './ImportMovieTitle.css';

function createMapStateToProps() {
  return createSelector(
    createUISettingsSelector(),
    (uiSettings) => {
      return {
        shortDateFormat: uiSettings.shortDateFormat,
        timeFormat: uiSettings.timeFormat
      };
    }
  );
}

function ImportMovieTitle(props) {
  const {
    itemType,
    title,
    releaseDate,
    year,
    studioTitle,
    isExistingMovie
  } = props;

  const { showRelativeDates, shortDateFormat } = props;

  let itemDescr = '';
  itemDescr = itemDescr + title;
  if (itemType === 'movie') {
    if (year) {
      itemDescr = `${itemDescr} (${year})`;
    }
  }

  return (
    <div className={styles.titleContainer}>
      {
        !!itemType &&
          <Label kind={kinds.SUCCESS}>{itemType}</Label>
      }
      {
        !!studioTitle &&
          <Label>{studioTitle}</Label>
      }
      {
        !!releaseDate && itemType === 'scene' &&
          <Label>{getRelativeDate({
            date: releaseDate,
            shortDateFormat,
            showRelativeDates
          })}</Label>
      }

      <div className={styles.title}>
        {itemDescr}
      </div>

      {
        isExistingMovie &&
          <Label
            kind={kinds.WARNING}
          >
            {translate('Existing')}
          </Label>
      }
    </div>
  );
}

ImportMovieTitle.propTypes = {
  itemType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  releaseDate: PropTypes.string,
  studioTitle: PropTypes.string,
  isExistingMovie: PropTypes.bool.isRequired,
  showRelativeDates: PropTypes.bool,
  shortDateFormat: PropTypes.string
};

export default connect(createMapStateToProps)(ImportMovieTitle);
