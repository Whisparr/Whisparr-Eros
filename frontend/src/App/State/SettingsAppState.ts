import AppSectionState, {
  AppSectionDeleteState,
  AppSectionItemState,
  AppSectionSaveState,
} from 'App/State/AppSectionState';
import CustomFormat from 'typings/CustomFormat';
import DelayProfile from 'typings/DelayProfile';
import DownloadClient from 'typings/DownloadClient';
import DownloadClientOptions from 'typings/Settings/DownloadClientOptions';

export interface DelayProfileAppState
  extends
    AppSectionState<DelayProfile>,
    AppSectionDeleteState,
    AppSectionSaveState {}

export interface DownloadClientAppState
  extends
    AppSectionState<DownloadClient>,
    AppSectionDeleteState,
    AppSectionSaveState {
  isTestingAll: boolean;
}

// The slice has always been here; the typing never declared it, which went
// unnoticed while `importListOptions` was the other item-section keeping
// `createSettingsSectionSelector`'s generic inhabited. Goes with section 11.
export interface DownloadClientOptionsAppState
  extends AppSectionItemState<DownloadClientOptions>, AppSectionSaveState {}

export interface CustomFormatAppState
  extends
    AppSectionState<CustomFormat>,
    AppSectionDeleteState,
    AppSectionSaveState {}

interface SettingsAppState {
  customFormats: CustomFormatAppState;
  delayProfiles: DelayProfileAppState;
  downloadClientOptions: DownloadClientOptionsAppState;
  downloadClients: DownloadClientAppState;
}

export default SettingsAppState;
