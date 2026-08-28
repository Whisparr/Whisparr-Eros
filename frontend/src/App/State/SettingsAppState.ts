import AppSectionState, {
  AppSectionDeleteState,
  AppSectionItemState,
  AppSectionSaveState,
  AppSectionSchemaState,
  PagedAppSectionState,
} from 'App/State/AppSectionState';
import CustomFormat from 'typings/CustomFormat';
import DelayProfile from 'typings/DelayProfile';
import DownloadClient from 'typings/DownloadClient';
import ImportList from 'typings/ImportList';
import ImportListExclusion from 'typings/ImportListExclusion';
import ImportListOptionsSettings from 'typings/ImportListOptionsSettings';

type Presets<T> = T & {
  presets: T[];
};

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

export interface ImportListAppState
  extends
    AppSectionState<ImportList>,
    AppSectionDeleteState,
    AppSectionSaveState,
    AppSectionSchemaState<Presets<ImportList>> {
  isTestingAll: boolean;
}

export interface CustomFormatAppState
  extends
    AppSectionState<CustomFormat>,
    AppSectionDeleteState,
    AppSectionSaveState {}

export interface ImportListOptionsSettingsAppState
  extends AppSectionItemState<ImportListOptionsSettings>, AppSectionSaveState {}

export interface ImportListExclusionsSettingsAppState
  extends
    AppSectionState<ImportListExclusion>,
    AppSectionSaveState,
    PagedAppSectionState,
    AppSectionDeleteState {
  pendingChanges: Partial<ImportListExclusion>;
}

interface SettingsAppState {
  customFormats: CustomFormatAppState;
  delayProfiles: DelayProfileAppState;
  downloadClients: DownloadClientAppState;
  importListExclusions: ImportListExclusionsSettingsAppState;
  importListOptions: ImportListOptionsSettingsAppState;
  importLists: ImportListAppState;
}

export default SettingsAppState;
