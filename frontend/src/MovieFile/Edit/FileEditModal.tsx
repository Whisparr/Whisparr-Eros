import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Modal from 'Components/Modal/Modal';
import Language from 'Language/Language';
import { QualityModel } from 'Quality/Quality';
import { fetchQualityProfileSchema } from 'Store/Actions/settingsActions';
import getQualities from 'Utilities/Quality/getQualities';
import { MovieFile } from '../MovieFile';
import { useUpdateMovieFiles } from '../useMovieFile';
import FileEditModalContent from './FileEditModalContent';

interface FileEditModalProps {
  isOpen: boolean;
  movieFile: MovieFile;
  onModalClose: (saved?: boolean) => void;
}

function FileEditModal({
  isOpen,
  movieFile,
  onModalClose,
}: FileEditModalProps) {
  const dispatch = useDispatch();
  const { mutate: updateMovieFiles } = useUpdateMovieFiles();
  const qualityProfiles = useSelector(
    (state: AppState) => state.settings.qualityProfiles
  );
  const languagesState = useSelector(
    (state: AppState) => state.settings.languages
  );

  const filterItems = ['Any', 'Original'];
  const filteredLanguages: Language[] = languagesState.items.filter(
    (lang: Language) => !filterItems.includes(lang.name)
  );

  const currentQuality = movieFile.quality;
  const qualityId = currentQuality ? currentQuality.quality.id : 0;
  const real = currentQuality ? currentQuality.revision.real > 0 : false;
  const proper = currentQuality ? currentQuality.revision.version > 1 : false;
  const languageIds = movieFile.languages
    ? movieFile.languages.map((l: Language) => l.id)
    : [];
  const indexerFlags = movieFile.indexerFlags ?? 0;
  const releaseGroup = movieFile.releaseGroup ?? '';
  const edition = movieFile.edition ?? '';
  const relativePath = movieFile.relativePath ?? '';

  const qualities = getQualities(qualityProfiles.schema.items);

  const isFetching =
    qualityProfiles.isSchemaFetching || languagesState.isFetching;
  const isPopulated =
    qualityProfiles.isSchemaPopulated && languagesState.isPopulated;
  const error = qualityProfiles.error || languagesState.error;

  useEffect(() => {
    if (!isPopulated) {
      dispatch(fetchQualityProfileSchema());
    }
  }, [isPopulated, dispatch]);

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
      const qualityIdNum = Number.parseInt(payload.qualityId, 10);
      const selectedQuality = qualities.find(
        (item: { id: number }) => item.id === qualityIdNum
      );
      const langs: Language[] = payload.languageIds
        .map((languageId) => {
          const id =
            typeof languageId === 'string'
              ? Number.parseInt(languageId, 10)
              : languageId;
          return filteredLanguages.find((item) => item.id === id);
        })
        .filter((lang): lang is Language => !!lang);
      // `isRepack` is not offered by this modal and was never sent, so the
      // server binds it to false and a repack saves as a plain proper. That is
      // Radarr's shape too; sending the same false keeps it verbatim rather
      // than changing behaviour here.
      const revision = {
        version: payload.proper ? 2 : 1,
        real: payload.real ? 1 : 0,
        isRepack: false,
      };
      const quality: QualityModel = { quality: selectedQuality, revision };

      updateMovieFiles([
        {
          id: movieFile.id,
          languages: langs,
          indexerFlags: payload.indexerFlags,
          edition: payload.edition,
          releaseGroup: payload.releaseGroup,
          quality,
        },
      ]);
      onModalClose(true);
    },
    [movieFile.id, qualities, filteredLanguages, updateMovieFiles, onModalClose]
  );

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
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
    </Modal>
  );
}

export default FileEditModal;
