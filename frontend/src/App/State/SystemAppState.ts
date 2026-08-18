import Task from 'typings/Task';
import Update from 'typings/Update';
import AppSectionState from './AppSectionState';

export type TaskAppState = AppSectionState<Task>;
export type UpdateAppState = AppSectionState<Update>;

interface SystemAppState {
  tasks: TaskAppState;
  updates: UpdateAppState;
}

export default SystemAppState;
