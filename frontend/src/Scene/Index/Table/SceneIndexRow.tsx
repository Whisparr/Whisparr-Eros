import React, { useCallback, useState } from 'react';
import { useSelect } from 'App/SelectContext';
import Command from 'Commands/Command';
import { MOVIE_SEARCH, REFRESH_MOVIE } from 'Commands/commandNames';
import { useExecuteCommand, useExecutingCommands } from 'Commands/useCommands';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import MovieTagList from 'Components/MovieTagList';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import VirtualTableSelectCell from 'Components/Table/Cells/VirtualTableSelectCell';
import Column from 'Components/Table/Column';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds } from 'Helpers/Props';
import EditMovieModal from 'Movie/Edit/EditMovieModal';
import Movie, { Statistics } from 'Movie/Movie';
import DeleteSceneModal from 'Scene/Delete/DeleteSceneModal';
import SceneDetailsLinks from 'Scene/Details/SceneDetailsLinks';
import SceneStudioTitleLink from 'Scene/SceneStudioTitleLink';
import SceneTitleLink from 'Scene/SceneTitleLink';
import { useQualityProfile } from 'Settings/Profiles/Quality/useQualityProfiles';
import { useUiSettingsValues } from 'Settings/UI/useUiSettings';
import { SelectStateInputProps } from 'typings/props';
import formatRuntime from 'Utilities/Date/formatRuntime';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import SceneIndexProgressBar from '../ProgressBar/SceneIndexProgressBar';
import { useSceneIndexOption } from '../sceneIndexOptionsStore';
import SceneStatusCell from './SceneStatusCell';
import styles from './SceneIndexRow.css';

interface SceneIndexRowProps {
  scene: Movie;
  sortKey: string;
  columns: Column[];
  isSelectMode: boolean;
}

function SceneIndexRow(props: Readonly<SceneIndexRowProps>) {
  const { scene, columns, isSelectMode } = props;
  const sceneId = scene.id;

  const qualityProfile = useQualityProfile(scene.qualityProfileId);

  const executingCommands = useExecutingCommands();

  const isRefreshingScene = executingCommands.some(
    (command: Command) =>
      command.name === REFRESH_MOVIE && command.body.movieId === sceneId
  );

  const isSearchingScene = executingCommands.some(
    (command: Command) =>
      command.name === MOVIE_SEARCH && command.body.movieId === sceneId
  );

  const { showSearchAction } = useSceneIndexOption('tableOptions');

  const { movieRuntimeFormat } = useUiSettingsValues();

  const {
    monitored,
    titleSlug,
    title,
    studioTitle,
    status,
    originalLanguage,
    added,
    statistics = {} as Statistics,
    year,
    releaseDate,
    runtime,
    path,
    genres = [],
    tags = [],
    foreignId,
    studioForeignId,
    isAvailable,
    hasFile,
    movieFile,
    isSaving = false,
  } = scene;

  const { sizeOnDisk = 0, releaseGroups = [] } = statistics;

  const executeCommand = useExecuteCommand();
  const [isEditSceneModalOpen, setIsEditSceneModalOpen] = useState(false);
  const [isDeleteSceneModalOpen, setIsDeleteSceneModalOpen] = useState(false);
  const [selectState, selectDispatch] = useSelect();

  const onRefreshPress = useCallback(() => {
    executeCommand({
      name: REFRESH_MOVIE,
      movieIds: [sceneId],
    });
  }, [sceneId, executeCommand]);

  const onSearchPress = useCallback(() => {
    executeCommand({
      name: MOVIE_SEARCH,
      movieIds: [sceneId],
    });
  }, [sceneId, executeCommand]);

  const onEditScenePress = useCallback(() => {
    setIsEditSceneModalOpen(true);
  }, [setIsEditSceneModalOpen]);

  const onEditSceneModalClose = useCallback(() => {
    setIsEditSceneModalOpen(false);
  }, [setIsEditSceneModalOpen]);

  const onDeleteScenePress = useCallback(() => {
    setIsEditSceneModalOpen(false);
    setIsDeleteSceneModalOpen(true);
  }, [setIsDeleteSceneModalOpen]);

  const onDeleteSceneModalClose = useCallback(() => {
    setIsDeleteSceneModalOpen(false);
  }, [setIsDeleteSceneModalOpen]);

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

  return (
    <>
      {isSelectMode ? (
        <VirtualTableSelectCell
          id={sceneId}
          isSelected={selectState.selectedState[sceneId]}
          isDisabled={false}
          onSelectedChange={onSelectedChange}
        />
      ) : null}

      {columns.map((column) => {
        const { name, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        if (name === 'status') {
          return (
            <SceneStatusCell
              key={name}
              className={styles[name]}
              movieId={sceneId}
              monitored={monitored}
              status={status}
              isSelectMode={isSelectMode}
              isSaving={isSaving}
              component={VirtualTableRowCell}
            />
          );
        }

        if (name === 'sortTitle') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              <SceneTitleLink titleSlug={titleSlug} title={title} />
            </VirtualTableRowCell>
          );
        }

        if (name === 'studioTitle') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              <SceneStudioTitleLink
                studioForeignId={studioForeignId}
                studioTitle={studioTitle}
              />
            </VirtualTableRowCell>
          );
        }

        if (name === 'originalLanguage') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              {originalLanguage.name}
            </VirtualTableRowCell>
          );
        }

        if (name === 'qualityProfileId') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              {qualityProfile?.name ?? ''}
            </VirtualTableRowCell>
          );
        }

        if (name === 'added') {
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts(2739)
            <RelativeDateCell
              key={name}
              className={styles[name]}
              date={added}
              component={VirtualTableRowCell}
            />
          );
        }

        if (name === 'year') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              {year}
            </VirtualTableRowCell>
          );
        }

        if (name === 'releaseDate') {
          return (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts(2739)
            <RelativeDateCell
              key={name}
              className={styles[name]}
              date={releaseDate}
              component={VirtualTableRowCell}
            />
          );
        }

        if (name === 'runtime') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              {formatRuntime(runtime, movieRuntimeFormat)}
            </VirtualTableRowCell>
          );
        }

        if (name === 'path') {
          return (
            <VirtualTableRowCell
              key={name}
              className={styles[name]}
              title={path}
            >
              {path}
            </VirtualTableRowCell>
          );
        }

        if (name === 'sizeOnDisk') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              {formatBytes(sizeOnDisk)}
            </VirtualTableRowCell>
          );
        }

        if (name === 'genres') {
          const joinedGenres = genres.join(', ');

          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              <span title={joinedGenres}>{joinedGenres}</span>
            </VirtualTableRowCell>
          );
        }

        if (name === 'movieStatus') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              <SceneIndexProgressBar
                sceneId={sceneId}
                sceneFile={movieFile}
                monitored={monitored}
                hasFile={hasFile}
                isAvailable={isAvailable}
                status={status}
                width={125}
                detailedProgressBar={true}
                bottomRadius={false}
                isStandAlone={true}
              />
            </VirtualTableRowCell>
          );
        }

        if (name === 'releaseGroups') {
          const joinedReleaseGroups = releaseGroups.join(', ');
          const truncatedReleaseGroups =
            releaseGroups.length > 3
              ? `${releaseGroups.slice(0, 3).join(', ')}...`
              : joinedReleaseGroups;

          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              <span title={joinedReleaseGroups}>{truncatedReleaseGroups}</span>
            </VirtualTableRowCell>
          );
        }

        if (name === 'tags') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              <MovieTagList tags={tags} />
            </VirtualTableRowCell>
          );
        }

        if (name === 'actions') {
          return (
            <VirtualTableRowCell key={name} className={styles[name]}>
              <span className={styles.externalLinks}>
                <Tooltip
                  anchor={<Icon name={icons.EXTERNAL_LINK} size={12} />}
                  tooltip={<SceneDetailsLinks foreignId={foreignId} />}
                  canFlip={true}
                  kind={kinds.INVERSE}
                />
              </span>

              <SpinnerIconButton
                name={icons.REFRESH}
                title={translate('RefreshScene')}
                isSpinning={isRefreshingScene}
                onPress={onRefreshPress}
              />

              {showSearchAction ? (
                <SpinnerIconButton
                  name={icons.SEARCH}
                  title={translate('SearchForScene')}
                  isSpinning={isSearchingScene}
                  onPress={onSearchPress}
                />
              ) : null}

              <IconButton
                name={icons.EDIT}
                title={translate('EditScene')}
                onPress={onEditScenePress}
              />
            </VirtualTableRowCell>
          );
        }

        return null;
      })}

      <EditMovieModal
        isOpen={isEditSceneModalOpen}
        movie={scene}
        onModalClose={onEditSceneModalClose}
        onDeleteMoviePress={onDeleteScenePress}
      />

      <DeleteSceneModal
        isOpen={isDeleteSceneModalOpen}
        scene={scene}
        onModalClose={onDeleteSceneModalClose}
      />
    </>
  );
}

export default SceneIndexRow;
