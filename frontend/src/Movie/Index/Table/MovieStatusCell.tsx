import React from 'react';
import Icon from 'Components/Icon';
import VirtualTableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons } from 'Helpers/Props';
import getMovieStatusDetails from 'Movie/getMovieStatusDetails';
import { MovieStatus } from 'Movie/Movie';
import translate from 'Utilities/String/translate';
import styles from './MovieStatusCell.css';

interface MovieStatusCellProps {
  className: string;
  movieId: number;
  monitored: boolean;
  status: MovieStatus;
  isSelectMode: boolean;
  isSaving: boolean;
  component?: React.ElementType;
}

function MovieStatusCell(props: MovieStatusCellProps) {
  const {
    className,
    movieId,
    monitored,
    status,
    isSelectMode,
    isSaving,
    component: Component = VirtualTableRowCell,
    ...otherProps
  } = props;

  const statusDetails = getMovieStatusDetails(status);

  return (
    <Component className={className} {...otherProps}>
      <Icon
        className={styles.statusIcon}
        name={monitored ? icons.FILM : icons.FILMUNMONITOR}
        title={
          monitored
            ? translate('MovieIsMonitored')
            : translate('MovieIsUnmonitored')
        }
      />

      <Icon
        className={styles.statusIcon}
        name={statusDetails.icon}
        title={`${statusDetails.title}: ${statusDetails.message}`}
      />
    </Component>
  );
}

export default MovieStatusCell;
