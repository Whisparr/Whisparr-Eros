import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import Column from 'Components/Table/Column';
import { SortDirection } from 'Helpers/Props/sortDirections';
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
import getQualities from 'Utilities/Quality/getQualities';
import { MovieFile } from '../MovieFile';
import useMovieFile from '../useMovieFile';
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
  columns: Column[];
  sortKey: string;
  sortDirection: string;
  isDeleting: boolean;
  isSaving: boolean;
  languages: LanguageProfile[];
  qualities: Quality[];
  error: unknown;
}

interface DispatchProps {
  fetchLanguages: () => void;
  fetchQualityProfileSchema: () => void;
  deleteMovieFile: (payload: { id: number }) => void;
  setMovieFilesTableOption: (payload: unknown) => void;
  setMovieFilesSort: (payload: {
    sortKey: string;
    sortDirection: string;
  }) => void;
}

type Props = OwnProps & StateProps & DispatchProps;

const mapDispatchToProps: DispatchProps = {
  fetchLanguages,
  fetchQualityProfileSchema,
  deleteMovieFile,
  setMovieFilesTableOption,
  setMovieFilesSort,
};

function MovieFileEditorTableContentConnector(props: Props) {
  const { fetchLanguages, fetchQualityProfileSchema, movieId } = props;
  useEffect(() => {
    fetchLanguages();
    fetchQualityProfileSchema();
  }, [fetchLanguages, fetchQualityProfileSchema]);

  // Fetch movie files via React Query
  const { data: items } = useMovieFile(movieId);

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

  const onSortPress = useCallback(
    (name: string, sortDirection?: SortDirection) => {
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
      items={items || []}
      columns={props.columns as Column[]}
      sortDirection={props.sortDirection as SortDirection}
      onDeletePress={onDeletePress}
      onTableOptionChange={onTableOptionChange}
      onSortPress={onSortPress}
    />
  );
}

export default connect<
  Omit<StateProps, 'items'>,
  DispatchProps,
  OwnProps,
  RootState
>(
  (state: RootState) => ({
    columns: state.movieFiles.columns,
    sortKey: state.movieFiles.sortKey,
    sortDirection: state.movieFiles.sortDirection,
    isDeleting: state.movieFiles.isDeleting,
    isSaving: state.movieFiles.isSaving,
    languages: state.settings.languages.items,
    qualities: getQualities(state.settings.qualityProfiles.schema.items),
    error: null,
  }),
  mapDispatchToProps
)(MovieFileEditorTableContentConnector);
