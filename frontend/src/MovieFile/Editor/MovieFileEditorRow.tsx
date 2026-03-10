import React, { useCallback, useState } from 'react';
import Icon from 'Components/Icon';
import IconButton from 'Components/Link/IconButton';
import ConfirmModal from 'Components/Modal/ConfirmModal';
import RelativeDateCell from 'Components/Table/Cells/RelativeDateCell';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import Column from 'Components/Table/Column';
import TableRow from 'Components/Table/TableRow';
import Popover from 'Components/Tooltip/Popover';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import Language from 'Language/Language';
import IndexerFlags from 'Movie/IndexerFlags';
import MovieFormats from 'Movie/MovieFormats';
import MovieLanguages from 'Movie/MovieLanguages';
import MovieQuality from 'Movie/MovieQuality';
import FileEditModal from 'MovieFile/Edit/FileEditModal';
import {
  MediaInfoDisplay,
  MediaInfoType as MediaInfoKind,
} from 'MovieFile/MediaInfo';
import * as mediaInfoTypes from 'MovieFile/mediaInfoTypes';
import { MovieFile } from 'MovieFile/MovieFile';
import { QualityModel } from 'Quality/Quality';
import CustomFormat from 'typings/CustomFormat';
import MediaInfoType from 'typings/MediaInfo';
import formatBytes from 'Utilities/Number/formatBytes';
import formatCustomFormatScore from 'Utilities/Number/formatCustomFormatScore';
import translate from 'Utilities/String/translate';
import FileDetailsModal from '../FileDetailsModal';
import styles from './MovieFileEditorRow.css';

interface MovieFileEditorRowProps {
  movieFile: MovieFile;
  id: number;
  size: number;
  relativePath: string;
  customFormats?: CustomFormat[];
  customFormatScore?: number;
  languages?: Language[];
  quality: QualityModel;
  qualityCutoffNotMet?: boolean;
  mediaInfo?: MediaInfoType;
  indexerFlags: number;
  dateAdded?: string;
  columns: Column[];
  onDeletePress: (id: number) => void;
  releaseGroup?: string;
}

function MovieFileEditorRow(props: MovieFileEditorRowProps) {
  const {
    movieFile,
    id,
    size,
    relativePath,
    customFormats = [],
    customFormatScore,
    languages,
    quality,
    qualityCutoffNotMet,
    indexerFlags,
    mediaInfo,
    dateAdded,
    columns,
    onDeletePress,
    releaseGroup,
  } = props;

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState<boolean>(false);

  const [isFileDetailsModalOpen, setIsFileDetailsModalOpen] =
    useState<boolean>(false);

  const [isFileEditModalOpen, setIsFileEditModalOpen] =
    useState<boolean>(false);

  const handleConfirmDelete = useCallback(() => {
    setIsConfirmDeleteModalOpen(false);
    onDeletePress(id);
  }, [id, onDeletePress]);

  const handleConfirmDeleteModalClose = useCallback(() => {
    setIsConfirmDeleteModalOpen(false);
  }, []);

  const handleFileDetailsPress = useCallback(() => {
    setIsFileDetailsModalOpen(true);
  }, []);

  const handleFileDetailsModalClose = useCallback(() => {
    setIsFileDetailsModalOpen(false);
  }, []);

  const handleFileEditPress = useCallback(() => {
    setIsFileEditModalOpen(true);
  }, []);

  const handleFileEditModalClose = useCallback(() => {
    setIsFileEditModalOpen(false);
  }, []);

  return (
    <TableRow>
      {columns.map((column: Column) => {
        const { name, isVisible } = column;
        if (!isVisible) return null;

        if (name === 'relativePath') {
          return (
            <TableRowCell
              key={name}
              className={styles.relativePath}
              title={relativePath}
            >
              {relativePath}
            </TableRowCell>
          );
        }

        if (name === 'customFormatScore') {
          return (
            <TableRowCell key={name} className={styles.customFormatScore}>
              <Tooltip
                anchor={formatCustomFormatScore(
                  customFormatScore,
                  customFormats.length
                )}
                tooltip={<MovieFormats formats={customFormats} />}
                position={tooltipPositions.LEFT}
              />
            </TableRowCell>
          );
        }

        if (name === 'languages') {
          return (
            <TableRowCell key={name} className={styles.languages}>
              <MovieLanguages languages={languages ?? []} />
            </TableRowCell>
          );
        }

        if (name === 'audioInfo') {
          return (
            <TableRowCell key={name} className={styles.audio}>
              <MediaInfoDisplay
                type={mediaInfoTypes.AUDIO as MediaInfoKind}
                mediaInfo={mediaInfo}
              />
            </TableRowCell>
          );
        }
        if (name === 'audioLanguages') {
          return (
            <TableRowCell key={name} className={styles.audioLanguages}>
              <MediaInfoDisplay
                type={mediaInfoTypes.AUDIO_LANGUAGES as MediaInfoKind}
                mediaInfo={mediaInfo}
              />
            </TableRowCell>
          );
        }

        if (name === 'subtitleLanguages') {
          return (
            <TableRowCell key={name} className={styles.subtitles}>
              <MediaInfoDisplay
                type={mediaInfoTypes.SUBTITLES as MediaInfoKind}
                mediaInfo={mediaInfo}
              />
            </TableRowCell>
          );
        }

        if (name === 'videoCodec') {
          return (
            <TableRowCell key={name} className={styles.video}>
              <MediaInfoDisplay
                type={mediaInfoTypes.VIDEO as MediaInfoKind}
                mediaInfo={mediaInfo}
              />
            </TableRowCell>
          );
        }

        if (name === 'videoDynamicRangeType') {
          return (
            <TableRowCell key={name} className={styles.videoDynamicRangeType}>
              <MediaInfoDisplay
                type={mediaInfoTypes.VIDEO_DYNAMIC_RANGE_TYPE as MediaInfoKind}
                mediaInfo={mediaInfo}
              />
            </TableRowCell>
          );
        }

        if (name === 'size') {
          return (
            <TableRowCell
              key={name}
              className={styles.size}
              title={String(size)}
            >
              {formatBytes(size)}
            </TableRowCell>
          );
        }

        if (name === 'quality') {
          return (
            <TableRowCell key={name} className={styles.quality}>
              <MovieQuality
                className={styles.quality}
                quality={quality}
                isCutoffNotMet={qualityCutoffNotMet}
              />
            </TableRowCell>
          );
        }

        if (name === 'customFormats') {
          return (
            <TableRowCell key={name}>
              <MovieFormats formats={customFormats} />
            </TableRowCell>
          );
        }

        if (name === 'indexerFlags') {
          console.log('[MovieFileEditorRow] indexerFlags:', indexerFlags);
          return (
            <TableRowCell key={name} className={styles.indexerFlags}>
              {indexerFlags ? (
                <Popover
                  anchor={<Icon name={icons.FLAG} />}
                  title={translate('IndexerFlags')}
                  body={<IndexerFlags indexerFlags={indexerFlags} />}
                  position={tooltipPositions.LEFT}
                />
              ) : null}
            </TableRowCell>
          );
        }

        if (name === 'releaseGroup') {
          return (
            <TableRowCell key={name} className={styles.releaseGroup}>
              {releaseGroup}
            </TableRowCell>
          );
        }

        if (name === 'dateAdded') {
          return (
            <RelativeDateCell
              key={name}
              className={styles.dateAdded}
              date={dateAdded}
            />
          );
        }

        if (name === 'actions') {
          return (
            <TableRowCell key={name} className={styles.actions}>
              <IconButton
                title={translate('EditMovieFile')}
                name={icons.EDIT}
                onPress={handleFileEditPress}
              />
              <IconButton
                title={translate('Details')}
                name={icons.MEDIA_INFO}
                onPress={handleFileDetailsPress}
              />
              <IconButton
                title={translate('DeleteFile')}
                name={icons.REMOVE}
                onPress={handleConfirmDelete}
              />
            </TableRowCell>
          );
        }
        return null;
      })}

      <FileDetailsModal
        isOpen={isFileDetailsModalOpen}
        mediaInfo={mediaInfo as MediaInfoType}
        onModalClose={handleFileDetailsModalClose}
      />

      <FileEditModal
        movieFile={movieFile}
        isOpen={isFileEditModalOpen}
        onModalClose={handleFileEditModalClose}
      />

      <ConfirmModal
        isOpen={isConfirmDeleteModalOpen}
        kind={kinds.DANGER}
        title={translate('DeleteSelectedMovieFiles')}
        message={translate('DeleteSelectedMovieFilesHelpText')}
        confirmLabel={translate('Delete')}
        onConfirm={handleConfirmDelete}
        onCancel={handleConfirmDeleteModalClose}
      />
    </TableRow>
  );
}

export default MovieFileEditorRow;
