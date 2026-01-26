import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import Column from 'Components/Table/Column';
import { SortDirection } from 'Helpers/Props/SortDirection';
import Quality from 'Quality/Quality';
import {
  deleteMovieFile,
  setMovieFilesSort,
  setMovieFilesTableOption,
} from 'Store/Actions/movieFileActions';
import {
  fetchLanguages,
  fetchQualityProfileSchema,
} from 'Store/Actions/settingsActions';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createMovieSelector from 'Store/Selectors/createMovieSelector';
import getQualities from 'Utilities/Quality/getQualities';
import { MovieFile } from '../MovieFile';
import MovieFileEditorTableContent from './MovieFileEditorTableContent';

interface LanguageProfile {
  [key: string]: unknown;
}

interface QualityProfileSchema {
  items: Quality[];
}

interface MovieFilesState {
  items: MovieFile[];
  columns: Column[];
  sortKey: string;
  sortDirection: string;
  isDeleting: boolean;
  isSaving: boolean;
}

interface SettingsState {
  languages: { items: LanguageProfile[] };
  qualityProfiles: { schema: QualityProfileSchema };
}

interface RootState {
  movieFiles: MovieFilesState;
  settings: SettingsState;
}

interface OwnProps {
  movieId: number;
}

interface StateProps {
  items: MovieFile[];
  columns: unknown[];
  sortKey: string;
  sortDirection: string;
  isDeleting: boolean;
  isSaving: boolean;
  error: unknown;
  languages: LanguageProfile[];
  qualities: unknown[];
}

interface DispatchProps {
  fetchQualityProfileSchema: () => void;
  fetchLanguages: () => void;
  deleteMovieFile: (payload: { id: number }) => void;
  setMovieFilesTableOption: (payload: unknown) => void;
  setMovieFilesSort: (payload: {
    sortKey: string;
    sortDirection: string;
  }) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

function createMapStateToProps() {
  return createSelector(
    (_: RootState, { movieId }: { movieId: number }) => movieId,
    createClientSideCollectionSelector('movieFiles'),
    (state: RootState) => state.settings.languages,
    (state: RootState) => state.settings.qualityProfiles,
    createMovieSelector(),
    (
      movieId: number,
      movieFiles: MovieFilesState,
      languageProfiles: { items: LanguageProfile[] },
      qualityProfiles: { schema: QualityProfileSchema }
    ) => {
      const languages = languageProfiles.items;
      const qualities = getQualities(qualityProfiles.schema.items);
      const filesForMovie = movieFiles.items.filter(
        (file) => file.movieId === movieId
      );
      return {
        items: filesForMovie,
        columns: movieFiles.columns,
        sortKey: movieFiles.sortKey,
        sortDirection: movieFiles.sortDirection,
        isDeleting: movieFiles.isDeleting,
        isSaving: movieFiles.isSaving,
        error: null,
        languages,
        qualities,
      };
    }
  );
}

const mapDispatchToProps: DispatchProps = {
  fetchQualityProfileSchema,
  fetchLanguages,
  deleteMovieFile,
  setMovieFilesTableOption,
  setMovieFilesSort,
};

function MovieFileEditorTableContentConnector({
  fetchLanguages,
  fetchQualityProfileSchema,
  ...props
}: Props) {
  useEffect(() => {
    fetchLanguages();
    fetchQualityProfileSchema();
  }, [fetchLanguages, fetchQualityProfileSchema]);

  const onDeletePress = useCallback(
    (movieFileId: number) => {
      props.deleteMovieFile({ id: movieFileId });
    },
    [props]
  );

  const onTableOptionChange = useCallback(
    (payload: unknown) => {
      props.setMovieFilesTableOption(payload);
    },
    [props]
  );

  // Table expects: (name: string, sortDirection?: SortDirection) => void
  const onSortPress = useCallback(
    (name: string, sortDirection?: SortDirection) => {
      // Fallback to current sortDirection if not provided
      props.setMovieFilesSort({
        sortKey: name,
        sortDirection: sortDirection ?? (props.sortDirection as string),
      });
    },
    [props]
  );

  return (
    <MovieFileEditorTableContent
      {...props}
      columns={props.columns as Column[]}
      sortDirection={props.sortDirection as SortDirection}
      onDeletePress={onDeletePress}
      onTableOptionChange={onTableOptionChange}
      onSortPress={onSortPress}
    />
  );
}

export default connect<StateProps, DispatchProps, OwnProps, RootState>(
  createMapStateToProps,
  mapDispatchToProps
)(MovieFileEditorTableContentConnector);
