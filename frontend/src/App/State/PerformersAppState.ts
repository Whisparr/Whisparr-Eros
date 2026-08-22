import Performer from 'Performer/Performer';
import AppSectionState, { AppSectionSaveState } from './AppSectionState';

interface PerformersAppState
  extends AppSectionSaveState, AppSectionState<Performer> {
  deleteOptions: {
    addImportExclusion: boolean;
  };

  pendingChanges: Partial<Performer>;
}

export default PerformersAppState;
