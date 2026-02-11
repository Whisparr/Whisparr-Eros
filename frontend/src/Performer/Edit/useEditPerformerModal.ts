import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { queryClient } from 'App/queryClient';
import AppState from 'App/State/AppState';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import { setPerformerValue } from 'Store/Actions/performerActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import { PendingSection } from 'typings/pending';
import Performer from '../Performer';

interface PerformerSettings {
  monitored: boolean;
  moviesMonitored: boolean;
  qualityProfileId: number;
  minimumAvailability?: string;
  rootFolderPath: string;
  tags: number[];
  searchOnAdd?: boolean;
}

interface UseEditPerformerModalResult {
  fullName: string;
  images: Performer['images'];
  overview?: string;
  isSaving: boolean;
  saveError: object | null;
  isPathChanging: boolean;
  originalPath: string;
  item: PendingSection<PerformerSettings>;
  isSmallScreen: boolean;
  safeForWorkMode: boolean;
  onInputChange: (payload: { name: string; value: unknown }) => void;
  onSavePress: () => void;
}

export default function useEditPerformerModal(
  performer: Performer
): UseEditPerformerModalResult {
  const dispatch = useDispatch();

  // Get state from Redux
  const performersState = useSelector((state: AppState) => state.performers);
  const safeForWorkMode = useSelector(
    (state: AppState) => state.settings.safeForWorkMode
  );
  const dimensions = useSelector(createDimensionsSelector());

  const { saveError, pendingChanges } = performersState;

  // Check if path is changing
  const isPathChanging =
    pendingChanges.rootFolderPath != null &&
    performer.rootFolderPath !== pendingChanges.rootFolderPath;

  // Build settings
  const performerSettings: PerformerSettings = {
    monitored: performer.monitored,
    moviesMonitored: performer.moviesMonitored,
    qualityProfileId: performer.qualityProfileId,
    minimumAvailability: (
      performer as unknown as {
        minimumAvailability?: string;
      }
    ).minimumAvailability,
    rootFolderPath: performer.rootFolderPath,
    tags: performer.tags,
    searchOnAdd: (performer as unknown as { searchOnAdd?: boolean })
      .searchOnAdd,
  };

  const settings = selectSettings(performerSettings, pendingChanges, saveError);

  // Mutation for saving performer
  const saveMutation = useApiMutation<Performer, Performer>({
    method: 'PUT',
    path: `/performer/${performer.id}`,
    mutationOptions: {
      onSuccess: (data) => {
        if (data?.foreignId) {
          // Invalidate React Query cache for this performer
          queryClient.invalidateQueries({
            queryKey: [`/performer/${data.foreignId}`],
          });
          queryClient.invalidateQueries({
            queryKey: [`/performer/${data.foreignId}/works`],
          });
        }
      },
    },
  });

  // Handlers
  const onInputChange = useCallback(
    ({ name, value }: { name: string; value: unknown }) => {
      // @ts-expect-error - Redux action not fully typed yet
      dispatch(setPerformerValue({ name, value }));
    },
    [dispatch]
  );

  const onSavePress = useCallback(() => {
    // Create updated performer object with pending changes
    const updatedPerformer = {
      ...performer,
      ...pendingChanges,
    };
    saveMutation.mutate(updatedPerformer);
  }, [performer, pendingChanges, saveMutation]);

  return {
    fullName: performer.fullName,
    images: performer.images,
    overview: (performer as unknown as { overview?: string }).overview,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    isPathChanging,
    originalPath: (performer as unknown as { path?: string }).path || '',
    item: settings.settings,
    isSmallScreen: dimensions.isSmallScreen,
    safeForWorkMode,
    onInputChange,
    onSavePress,
  };
}
