import React, { useCallback, useState } from 'react';
import { useSelect } from 'App/SelectContext';
import { SafeForWorkModeContext } from 'App/State/SafeForWorkContext';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import MovieTagList from 'Components/MovieTagList';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import VirtualTableSelectCell from 'Components/Table/Cells/VirtualTableSelectCell';
import Column from 'Components/Table/Column';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds } from 'Helpers/Props';
import QUalityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import StudioDetailsLinks from 'Studio/Details/StudioDetailsLinks';
import EditStudioModal from 'Studio/Edit/EditStudioModal';
import Studio from 'Studio/Studio';
import StudioTitleLink from 'Studio/StudioTitleLink';
import { SelectStateInputProps } from 'typings/props';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import styles from './StudioIndexRow.css';

interface StudioIndexRowProps {
  studio: Studio;
  sortKey: string;
  columns: Column[];
  isSelectMode: boolean;
}

function StudioIndexRow(props: StudioIndexRowProps) {
  const { studio, columns, isSelectMode } = props;
  const { id: studioId, qualityProfileId } = studio;

  const {
    foreignId,
    title,
    tmdbId,
    tpdbId,
    aliases = [],
    monitored,
    movieCount,
    moviesMonitored,
    network,
    rootFolderPath,
    sceneCount,
    sizeOnDisk,
    tags = [],
    totalMovieCount,
    totalSceneCount,
    website,
  } = studio;

  const safeForWorkMode = React.useContext(SafeForWorkModeContext);
  const [isEditStudioModalOpen, setIsEditStudioModalOpen] = useState(false);
  const [selectState, selectDispatch] = useSelect();

  const onEditStudioPress = useCallback(() => {
    setIsEditStudioModalOpen(true);
  }, [setIsEditStudioModalOpen]);

  const onEditStudioModalClose = useCallback(() => {
    setIsEditStudioModalOpen(false);
  }, [setIsEditStudioModalOpen]);

  const onSelectedChange = useCallback(
    ({ id, value, shiftKey }: SelectStateInputProps) => {
      selectDispatch({
        type: 'toggleSelected',
        id,
        isSelected: value,
        shiftKey,
      });
    },
    [selectDispatch]
  );

  const cells: React.ReactNode[] = [];

  if (isSelectMode) {
    cells.push(
      <td key="select">
        <VirtualTableSelectCell
          id={studioId}
          isSelected={selectState.selectedState[studioId]}
          isDisabled={false}
          onSelectedChange={onSelectedChange}
        />
      </td>
    );
  }

  columns.forEach((column) => {
    const { name, isVisible } = column;

    if (!isVisible) {
      return;
    }

    if (name === 'status') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          <Icon
            containerClassName={
              monitored
                ? styles.statusIcon
                : `${styles.statusIcon} ${styles.unmonitored}`
            }
            title="scene"
            name={monitored ? icons.SCENE : icons.SCENEUNMONITOR}
          />
          <Icon
            containerClassName={
              moviesMonitored
                ? styles.statusIcon
                : `${styles.statusIcon} ${styles.unmonitored}`
            }
            title="movie"
            name={moviesMonitored ? icons.FILM : icons.FILMUNMONITOR}
          />
        </TableRowCell>
      );
      return;
    }

    if (name === 'sortTitle') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          <StudioTitleLink foreignId={foreignId} title={title} />
        </TableRowCell>
      );
      return;
    }

    if (name === 'network') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {network}
        </TableRowCell>
      );
      return;
    }

    if (name === 'qualityProfileId') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          <QUalityProfileName qualityProfileId={qualityProfileId} />
        </TableRowCell>
      );
      return;
    }

    if (name === 'rootFolderPath') {
      cells.push(
        <TableRowCell
          key={name}
          className={safeForWorkMode ? styles.blur : styles[name]}
          title={rootFolderPath}
        >
          {rootFolderPath}
        </TableRowCell>
      );
      return;
    }

    if (name === 'tags') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          <MovieTagList tags={tags} />
        </TableRowCell>
      );
      return;
    }

    if (name === 'aliases') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {aliases}
        </TableRowCell>
      );
      return;
    }

    if (name === 'totalMovieCount') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {`${movieCount} / ${totalMovieCount}`}
        </TableRowCell>
      );
      return;
    }

    if (name === 'totalSceneCount') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {` ${sceneCount} / ${totalSceneCount}`}
        </TableRowCell>
      );
      return;
    }

    if (name === 'sizeOnDisk') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {formatBytes(sizeOnDisk)}
        </TableRowCell>
      );
      return;
    }

    if (name === 'actions') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          <span className={styles.externalLinks}>
            <Tooltip
              anchor={<Icon name={icons.EXTERNAL_LINK} size={12} />}
              tooltip={
                <StudioDetailsLinks
                  foreignId={foreignId}
                  website={website}
                  tmdbId={tmdbId}
                  tpdbId={tpdbId}
                />
              }
              canFlip={true}
              kind={kinds.INVERSE}
            />
          </span>

          <IconButton
            name={icons.EDIT}
            title={translate('EditStudio')}
            onPress={onEditStudioPress}
          />
        </TableRowCell>
      );
      return;
    }
  });

  cells.push(
    <TableRowCell key="edit-modal" style={{ display: 'none' }}>
      <EditStudioModal
        isOpen={isEditStudioModalOpen}
        studio={studio}
        onModalClose={onEditStudioModalClose}
      />
    </TableRowCell>
  );

  return cells;
}

export default StudioIndexRow;
