import Studio from 'Studio/Studio';
import AppSectionState, { AppSectionSaveState } from './AppSectionState';

interface StudiosAppState extends AppSectionSaveState, AppSectionState<Studio> {
  deleteOptions: {
    addImportExclusion: boolean;
  };

  pendingChanges: Partial<Studio>;
}

export default StudiosAppState;
