import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';
import SettingsAppState from 'App/State/SettingsAppState';
import Language from 'Language/Language';
import { updateMovieFiles } from 'Store/Actions/movieFileActions';
import { fetchQualityProfileSchema } from 'Store/Actions/settingsActions';
import createMovieFileSelector from 'Store/Selectors/createMovieFileSelector';
import QualityProfile from 'typings/QualityProfile';
import getQualities from 'Utilities/Quality/getQualities';
import { MovieFile } from '../MovieFile';
import FileEditModalContent from './FileEditModalContent';

function createMapStateToProps() {
  return createSelector(
    createMovieFileSelector(),
    (state: AppState) => state.settings.qualityProfiles,
    (state: AppState) => state.settings.languages,
    (
      movieFile: MovieFile | undefined,
      qualityProfiles: SettingsAppState['qualityProfiles'],
      languages: SettingsAppState['languages']
    ) => {
      const filterItems = ['Any', 'Original'];
      const filteredLanguages: Language[] = languages.items.filter(
        (lang: Language) => !filterItems.includes(lang.name)
      );
      const quality = movieFile?.quality;
      return {
        isFetching: qualityProfiles.isSchemaFetching || languages.isFetching,
        isPopulated: qualityProfiles.isSchemaPopulated && languages.isPopulated,
        error: qualityProfiles.error || languages.error,
        qualityId: quality ? quality.quality.id : 0,
        real: quality ? quality.revision.real > 0 : false,
        proper: quality ? quality.revision.version > 1 : false,
        qualities: getQualities(qualityProfiles.schema.items),
        languageIds: movieFile?.languages
          ? movieFile.languages.map((l: Language) => l.id)
          : [],
        languages: filteredLanguages,
        indexerFlags: movieFile?.indexerFlags ?? 0,
        edition: '',
        releaseGroup: movieFile?.releaseGroup ?? '',
        relativePath: movieFile?.relativePath ?? '',
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchFetchQualityProfileSchema: fetchQualityProfileSchema,
  dispatchUpdateMovieFiles: updateMovieFiles,
};

export interface FileEditModalContentConnectorProps {
  movieFileId: number;
  isFetching: boolean;
  isPopulated: boolean;
  error?: object | undefined;
  qualities: QualityProfile[];
  languages: Language[];
  languageIds: number[];
  indexerFlags: number;
  qualityId: number;
  real: boolean;
  edition: string;
  releaseGroup: string;
  relativePath: string;
  proper: boolean;
  dispatchFetchQualityProfileSchema: () => void;
  dispatchUpdateMovieFiles: (payload: {
    files: Array<{
      id: number;
      languages: Language[];
      indexerFlags: number;
      edition: string;
      releaseGroup: string;
      quality: {
        quality: QualityProfile | undefined;
        revision: { version: number; real: number };
      };
    }>;
  }) => void;
  onModalClose: (saved?: boolean) => void;
}

function FileEditModalContentConnector(
  props: FileEditModalContentConnectorProps
) {
  const {
    movieFileId,
    isFetching,
    isPopulated,
    error,
    qualities,
    languages,
    languageIds,
    indexerFlags,
    qualityId,
    real,
    edition,
    releaseGroup,
    relativePath,
    proper,
    dispatchFetchQualityProfileSchema,
    dispatchUpdateMovieFiles,
    onModalClose,
  } = props;

  useEffect(() => {
    if (!isPopulated) {
      dispatchFetchQualityProfileSchema();
    }
  }, [isPopulated, dispatchFetchQualityProfileSchema]);

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
      const quality = qualities.find((item) => item.id === qualityIdNum);
      const langs: Language[] = payload.languageIds
        .map((languageId) => {
          const id =
            typeof languageId === 'string' ? parseInt(languageId) : languageId;
          return languages.find((item) => item.id === id);
        })
        .filter((lang): lang is Language => !!lang);
      const revision = {
        version: payload.proper ? 2 : 1,
        real: payload.real ? 1 : 0,
      };
      dispatchUpdateMovieFiles({
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
      });
      onModalClose(true);
    },
    [movieFileId, qualities, languages, dispatchUpdateMovieFiles, onModalClose]
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
      languages={languages}
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
export default connect(
  createMapStateToProps,
  mapDispatchToProps
)(FileEditModalContentConnector);
