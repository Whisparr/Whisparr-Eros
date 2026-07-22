import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Modal from 'Components/Modal/Modal';
import Language from 'Language/Language';
import { updateMovieFiles } from 'Store/Actions/movieFileActions';
import { fetchQualityProfileSchema } from 'Store/Actions/settingsActions';
import getQualities from 'Utilities/Quality/getQualities';
import { MovieFile } from '../MovieFile';
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

  const quality = movieFile.quality;
  const qualityId = quality ? quality.quality.id : 0;
  const real = quality ? quality.revision.real > 0 : false;
  const proper = quality ? quality.revision.version > 1 : false;
  const languageIds = movieFile.languages
    ? movieFile.languages.map((l: Language) => l.id)
    : [];
  const indexerFlags = movieFile.indexerFlags ?? 0;
  const releaseGroup = movieFile.releaseGroup ?? '';
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
      const quality = qualities.find(
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
      const revision = {
        version: payload.proper ? 2 : 1,
        real: payload.real ? 1 : 0,
      };
      dispatch(
        updateMovieFiles({
          files: [
            {
              id: movieFile.id,
              languages: langs,
              indexerFlags: payload.indexerFlags,
              edition: payload.edition,
              releaseGroup: payload.releaseGroup,
              quality: { quality, revision },
            },
          ],
        })
      );
      onModalClose(true);
    },
    [movieFile.id, qualities, filteredLanguages, dispatch, onModalClose]
  );

  return (
    <Modal isOpen={isOpen} onModalClose={onModalClose}>
      <FileEditModalContent
        qualityId={qualityId}
        proper={proper}
        real={real}
        relativePath={relativePath}
        edition=""
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
