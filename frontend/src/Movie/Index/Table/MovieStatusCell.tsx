import React from 'react';
import Icon from 'Components/Icon';
import StatusIndicator from 'Components/StatusIndicator';
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
      <StatusIndicator
        className={styles.statusIcon}
        label={
          monitored
            ? translate('MovieIsMonitored')
            : translate('MovieIsUnmonitored')
        }
        title={
          monitored
            ? translate('MovieIsMonitored')
            : translate('MovieIsUnmonitored')
        }
      >
        <Icon name={monitored ? icons.FILM : icons.FILMUNMONITOR} />
      </StatusIndicator>

      <StatusIndicator
        className={styles.statusIcon}
        label={statusDetails.message}
        title={`${statusDetails.title}: ${statusDetails.message}`}
      >
        <Icon name={statusDetails.icon} />
      </StatusIndicator>
    </Component>
  );
}

export default MovieStatusCell;
