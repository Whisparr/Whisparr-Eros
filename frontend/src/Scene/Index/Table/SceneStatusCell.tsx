import React from 'react';
import Icon from 'Components/Icon';
import VirtualTableRowCell from 'Components/Table/Cells/TableRowCell';
import { icons } from 'Helpers/Props';
import { getSceneStatusDetails } from 'Scene/SceneStatus';
import translate from 'Utilities/String/translate';
import styles from './SceneStatusCell.css';

interface SceneStatusCellProps {
  className: string;
  movieId: number;
  monitored: boolean;
  status: string;
  isSelectMode: boolean;
  isSaving: boolean;
  component?: React.ElementType;
}

function SceneStatusCell(props: SceneStatusCellProps) {
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

  const statusDetails = getSceneStatusDetails(status);

  return (
    <Component className={className} {...otherProps}>
      <Icon
        className={styles.statusIcon}
        name={monitored ? icons.SCENE : icons.SCENEUNMONITOR}
        title={monitored ? translate('Monitored') : translate('Unmonitored')}
      />

      <Icon
        className={styles.statusIcon}
        name={statusDetails.icon}
        title={`${statusDetails.title}: ${statusDetails.message}`}
      />
    </Component>
  );
}

export default SceneStatusCell;
