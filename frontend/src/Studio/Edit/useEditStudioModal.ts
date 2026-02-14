import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import useApiMutation from 'Helpers/Hooks/useApiMutation';
import { setStudioValue } from 'Store/Actions/studioActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import selectSettings from 'Store/Selectors/selectSettings';
import Studio from 'Studio/Studio';
import type { PendingSection } from 'typings/pending';

interface StudioSettings {
  monitored: boolean;
  moviesMonitored: boolean;
  afterDate?: string | null;
  qualityProfileId: number;
  minimumAvailability?: string;
  rootFolderPath: string;
  tags: number[];
  searchTitle?: string;
  searchOnAdd?: boolean;
}

interface UseEditStudioModalResult {
  title: string;
  images: Studio['images'];
  overview?: string;
  isSaving: boolean;
  saveError: object | null;
  isPathChanging: boolean;
  originalPath: string;
  item: PendingSection<StudioSettings>;
  isSmallScreen: boolean;
  onInputChange: (payload: { name: string; value: unknown }) => void;
  onSavePress: () => void;
}

export default function useEditStudioModal(
  studio: Studio
): UseEditStudioModalResult {
  const dispatch = useDispatch();
  const studiosState = useSelector((state: AppState) => state.studios);
  const dimensions = useSelector(createDimensionsSelector());

  const { saveError, pendingChanges } = studiosState;

  const isPathChanging = useMemo(
    () =>
      pendingChanges.rootFolderPath != null &&
      studio.rootFolderPath !== pendingChanges.rootFolderPath,
    [pendingChanges.rootFolderPath, studio.rootFolderPath]
  );

  const onInputChange = useCallback(
    ({ name, value }: { name: string; value: unknown }) => {
      // @ts-expect-error - Redux action not fully typed yet
      dispatch(setStudioValue({ name, value }));
    },
    [dispatch]
  );

  // Mutation for saving studio
  const saveMutation = useApiMutation<Studio, Studio>({
    method: 'PUT',
    path: `/studio/${studio.id}`,
  });

  const onSavePress = useCallback(() => {
    // Create updated studio object with pending changes
    const updatedStudio = {
      ...studio,
      ...pendingChanges,
    };
    saveMutation.mutate(updatedStudio);
  }, [studio, pendingChanges, saveMutation]);

  const studioSettings: StudioSettings = {
    monitored: studio.monitored,
    moviesMonitored: studio.moviesMonitored,
    afterDate: (studio as unknown as { afterDate?: string | null }).afterDate,
    qualityProfileId: studio.qualityProfileId,
    minimumAvailability: (studio as unknown as { minimumAvailability?: string })
      .minimumAvailability,
    rootFolderPath: studio.rootFolderPath,
    tags: studio.tags,
    searchTitle: (studio as unknown as { searchTitle?: string }).searchTitle,
    searchOnAdd: (studio as unknown as { searchOnAdd?: boolean }).searchOnAdd,
  };

  const settings = selectSettings(studioSettings, pendingChanges, saveError);

  return {
    title: studio.title,
    images: studio.images,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    isPathChanging,
    originalPath: (studio as unknown as { path?: string }).path || '',
    item: settings.settings,
    isSmallScreen: dimensions.isSmallScreen,
    onInputChange,
    onSavePress,
  };
}
