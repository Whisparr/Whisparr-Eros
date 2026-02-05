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
import PerformerDetailsLinks from 'Performer/Details/PerformerDetailsLinks';
import EditPerformerModal from 'Performer/Edit/EditPerformerModal';
import Performer from 'Performer/Performer';
import PerformerNameLink from 'Performer/PerformerNameLink';
import QualityProfileName from 'Settings/Profiles/Quality/QualityProfileName';
import { SelectStateInputProps } from 'typings/props';
import formatBytes from 'Utilities/Number/formatBytes';
import firstCharToUpper from 'Utilities/String/firstCharToUpper';
import translate from 'Utilities/String/translate';
import styles from './PerformerIndexRow.css';

interface PerformerIndexRowProps {
  performer: Performer;
  sortKey: string;
  columns: Column[];
  isSelectMode: boolean;
}

function PerformerIndexRow(props: PerformerIndexRowProps) {
  const { performer, columns, isSelectMode } = props;
  const {
    id: performerId,
    fullName,
    monitored,
    moviesMonitored,
    gender,
    age,
    careerStart,
    careerEnd,
    hairColor,
    ethnicity,
    rootFolderPath,
    qualityProfileId,
    movieCount,
    totalMovieCount,
    sceneCount,
    totalSceneCount,
    sizeOnDisk,
    tags = [],
    foreignId,
    tmdbId,
    tpdbId,
  } = performer;

  const [isEditPerformerModalOpen, setIsEditPerformerModalOpen] =
    useState(false);
  const [selectState, selectDispatch] = useSelect();
  const safeForWorkMode = React.useContext(SafeForWorkModeContext);

  const onEditPerformerPress = useCallback(() => {
    setIsEditPerformerModalOpen(true);
  }, [setIsEditPerformerModalOpen]);

  const onEditPerformerModalClose = useCallback(() => {
    setIsEditPerformerModalOpen(false);
  }, [setIsEditPerformerModalOpen]);

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
          id={performerId}
          isSelected={selectState.selectedState[performerId]}
          isDisabled={false}
          onSelectedChange={onSelectedChange}
        />
      </td>
    );
  }

  columns.forEach((column) => {
    const { name, isVisible } = column;
    if (!isVisible) return;

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
    if (name === 'fullName') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          <PerformerNameLink foreignId={foreignId} title={fullName} />
        </TableRowCell>
      );
      return;
    }
    if (name === 'gender') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {firstCharToUpper(gender)}
        </TableRowCell>
      );
      return;
    }
    if (name === 'age') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {age}
        </TableRowCell>
      );
      return;
    }
    if (name === 'careerStart') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {careerStart}
        </TableRowCell>
      );
      return;
    }
    if (name === 'careerEnd') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {careerEnd}
        </TableRowCell>
      );
      return;
    }
    if (name === 'hairColor') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {firstCharToUpper(hairColor)}
        </TableRowCell>
      );
      return;
    }
    if (name === 'ethnicity') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {firstCharToUpper(ethnicity)}
        </TableRowCell>
      );
      return;
    }
    if (name === 'qualityProfileId') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          <QualityProfileName qualityProfileId={qualityProfileId} />
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
    if (name === 'totalMovieCount') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {movieCount} / {totalMovieCount}
        </TableRowCell>
      );
      return;
    }
    if (name === 'totalSceneCount') {
      cells.push(
        <TableRowCell key={name} className={styles[name]}>
          {sceneCount} / {totalSceneCount}
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
                <PerformerDetailsLinks
                  foreignId={foreignId}
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
            title={translate('EditPerformer')}
            onPress={onEditPerformerPress}
          />
        </TableRowCell>
      );
      return;
    }
  });

  cells.push(
    <TableRowCell key="edit-modal" style={{ display: 'none' }}>
      <EditPerformerModal
        isOpen={isEditPerformerModalOpen}
        performer={performer}
        onModalClose={onEditPerformerModalClose}
      />
    </TableRowCell>
  );

  return cells;
}

export default PerformerIndexRow;
