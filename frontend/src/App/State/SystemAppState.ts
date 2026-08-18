import AppSectionState from './AppSectionState';

// `logs` is all that is left of the system slice. It is read only by the Events
// connectors, which are still .js, so there is no typed model for it yet; it
// retires with the Events page.
export type LogsAppState = AppSectionState<unknown>;

interface SystemAppState {
  logs: LogsAppState;
}

export default SystemAppState;
