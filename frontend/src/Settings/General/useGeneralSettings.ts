import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import { fetchGeneralSettings } from 'Store/Actions/settingsActions';

// Used to fetch general.whisparrMovieMetadataSource setting
export function useGeneralSettings() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGeneralSettings());
  }, [dispatch]);

  return useSelector((state: AppState) => state.settings.general.item);
}
