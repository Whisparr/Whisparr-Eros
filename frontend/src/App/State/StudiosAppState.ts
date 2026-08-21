import Studio from 'Studio/Studio';
import AppSectionState, { AppSectionSaveState } from './AppSectionState';

interface StudiosAppState extends AppSectionSaveState, AppSectionState<Studio> {
  pendingChanges: Partial<Studio>;
}

export default StudiosAppState;
