import AppSectionState, {
  AppSectionDeleteState,
  AppSectionSaveState,
} from 'App/State/AppSectionState';
import DownloadClient from 'typings/DownloadClient';

export interface DownloadClientAppState
  extends
    AppSectionState<DownloadClient>,
    AppSectionDeleteState,
    AppSectionSaveState {
  isTestingAll: boolean;
}

interface SettingsAppState {
  downloadClients: DownloadClientAppState;
}

export default SettingsAppState;
