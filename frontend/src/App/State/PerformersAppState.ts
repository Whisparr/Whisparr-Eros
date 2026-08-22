import Performer from 'Performer/Performer';
import AppSectionState, { AppSectionSaveState } from './AppSectionState';

interface PerformersAppState
  extends AppSectionSaveState, AppSectionState<Performer> {
  pendingChanges: Partial<Performer>;
}

export default PerformersAppState;
