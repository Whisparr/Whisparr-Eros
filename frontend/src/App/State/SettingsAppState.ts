import AppSectionState, {
  AppSectionDeleteState,
  AppSectionItemState,
  AppSectionSaveState,
  AppSectionSchemaState,
  PagedAppSectionState,
} from 'App/State/AppSectionState';
import AutoTagging, { AutoTaggingSpecification } from 'typings/AutoTagging';
import CustomFormat from 'typings/CustomFormat';
import DelayProfile from 'typings/DelayProfile';
import DownloadClient from 'typings/DownloadClient';
import ImportList from 'typings/ImportList';
import ImportListExclusion from 'typings/ImportListExclusion';
import ImportListOptionsSettings from 'typings/ImportListOptionsSettings';
import Indexer from 'typings/Indexer';

type Presets<T> = T & {
  presets: T[];
};

export interface AutoTaggingAppState
  extends
    AppSectionState<AutoTagging>,
    AppSectionDeleteState,
    AppSectionSaveState {}

export interface AutoTaggingSpecificationAppState
  extends
    AppSectionState<AutoTaggingSpecification>,
    AppSectionDeleteState,
    AppSectionSaveState,
    AppSectionSchemaState<AutoTaggingSpecification> {}

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

export interface IndexerAppState
  extends
    AppSectionState<Indexer>,
    AppSectionDeleteState,
    AppSectionSaveState,
    AppSectionSchemaState<Presets<Indexer>> {
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
  autoTaggings: AutoTaggingAppState;
  autoTaggingSpecifications: AutoTaggingSpecificationAppState;
  customFormats: CustomFormatAppState;
  delayProfiles: DelayProfileAppState;
  downloadClients: DownloadClientAppState;
  importListExclusions: ImportListExclusionsSettingsAppState;
  importListOptions: ImportListOptionsSettingsAppState;
  importLists: ImportListAppState;
  indexers: IndexerAppState;
}

export default SettingsAppState;
