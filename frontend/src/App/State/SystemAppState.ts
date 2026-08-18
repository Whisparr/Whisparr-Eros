import Health from 'typings/Health';
import Task from 'typings/Task';
import Update from 'typings/Update';
import AppSectionState from './AppSectionState';

export type HealthAppState = AppSectionState<Health>;
export type TaskAppState = AppSectionState<Task>;
export type UpdateAppState = AppSectionState<Update>;

interface SystemAppState {
  health: HealthAppState;
  tasks: TaskAppState;
  updates: UpdateAppState;
}

export default SystemAppState;
