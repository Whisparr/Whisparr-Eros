import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Language from 'Language/Language';
import { updateMovieFiles } from 'Store/Actions/movieFileActions';
import { fetchQualityProfileSchema } from 'Store/Actions/settingsActions';
import getQualities from 'Utilities/Quality/getQualities';
import { useSingleMovieFile } from '../useMovieFile';
import FileEditModalContent from './FileEditModalContent';

interface FileEditModalContentConnectorProps {
  movieFileId: number;
  onModalClose: (saved?: boolean) => void;
}

function FileEditModalContentConnector({
  movieFileId,
  onModalClose,
}: FileEditModalContentConnectorProps) {
  // Redux selectors for settings
  const qualityProfiles = useSelector(
    (state: AppState) => state.settings.qualityProfiles
  );
  const languagesState = useSelector(
    (state: AppState) => state.settings.languages
  );
  const dispatch = useDispatch();

  // React Query for movie file
  const {
    data: movieFile,
    isLoading: isMovieFileLoading,
    error: movieFileError,
  } = useSingleMovieFile(movieFileId);

  // Filtered languages
  const filterItems = ['Any', 'Original'];
  const filteredLanguages: Language[] = languagesState.items.filter(
    (lang: Language) => !filterItems.includes(lang.name)
  );

  // Quality and language info from movieFile
  const quality = movieFile?.quality;
  const qualityId = quality ? quality.quality.id : 0;
  const real = quality ? quality.revision.real > 0 : false;
  const proper = quality ? quality.revision.version > 1 : false;
  const languageIds = movieFile?.languages
    ? movieFile.languages.map((l: Language) => l.id)
    : [];
  const indexerFlags = movieFile?.indexerFlags ?? 0;
  const edition = '';
  const releaseGroup = movieFile?.releaseGroup ?? '';
  const relativePath = movieFile?.relativePath ?? '';

  // Qualities from schema
  const qualities = getQualities(qualityProfiles.schema.items);

  // Fetching and error states
  const isFetching =
    qualityProfiles.isSchemaFetching ||
    languagesState.isFetching ||
    isMovieFileLoading;
  const isPopulated =
    qualityProfiles.isSchemaPopulated && languagesState.isPopulated;
  const error = qualityProfiles.error || languagesState.error || movieFileError;

  // Fetch schema if not populated
  useEffect(() => {
    if (!isPopulated) {
      dispatch(fetchQualityProfileSchema());
    }
  }, [isPopulated, dispatch]);

  // Save handler
  const handleSaveInputs = useCallback(
    (payload: {
      qualityId: string;
      real: boolean;
      proper: boolean;
      languageIds: (number | string)[];
      edition: string;
      releaseGroup: string;
      indexerFlags: number;
    }) => {
      const qualityIdNum = parseInt(payload.qualityId);
      const quality = qualities.find(
        (item: { id: number }) => item.id === qualityIdNum
      );
      const langs: Language[] = payload.languageIds
        .map((languageId) => {
          const id =
            typeof languageId === 'string' ? parseInt(languageId) : languageId;
          return filteredLanguages.find((item) => item.id === id);
        })
        .filter((lang): lang is Language => !!lang);
      const revision = {
        version: payload.proper ? 2 : 1,
        real: payload.real ? 1 : 0,
      };
      dispatch(
        updateMovieFiles({
          files: [
            {
              id: movieFileId,
              languages: langs,
              indexerFlags: payload.indexerFlags,
              edition: payload.edition,
              releaseGroup: payload.releaseGroup,
              quality: {
                quality,
                revision,
              },
            },
          ],
        })
      );
      onModalClose(true);
    },
    [movieFileId, qualities, filteredLanguages, dispatch, onModalClose]
  );

  return (
    <FileEditModalContent
      qualityId={qualityId}
      proper={proper}
      real={real}
      relativePath={relativePath}
      edition={edition}
      releaseGroup={releaseGroup}
      languageIds={languageIds}
      languages={filteredLanguages}
      indexerFlags={indexerFlags}
      isFetching={isFetching}
      isPopulated={isPopulated}
      error={error}
      qualities={qualities}
      onSaveInputs={handleSaveInputs}
      onModalClose={onModalClose}
    />
  );
}

export default FileEditModalContentConnector;
