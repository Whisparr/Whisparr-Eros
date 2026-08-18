import Update from 'typings/Update';
import AppSectionState from './AppSectionState';

export type UpdateAppState = AppSectionState<Update>;

interface SystemAppState {
  updates: UpdateAppState;
}

export default SystemAppState;
