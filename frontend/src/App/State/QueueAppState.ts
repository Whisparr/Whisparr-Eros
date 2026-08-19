import Queue from 'typings/Queue';
import AppSectionState, {
  AppSectionFilterState,
  Error,
  PagedAppSectionState,
  TableAppSectionState,
} from './AppSectionState';

export interface QueuePagedAppState
  extends
    AppSectionState<Queue>,
    AppSectionFilterState<Queue>,
    PagedAppSectionState,
    TableAppSectionState {
  isGrabbing: boolean;
  grabError: Error;
  isRemoving: boolean;
  removeError: Error;
}

interface QueueAppState {
  paged: QueuePagedAppState;
  options: {
    includeUnknownMovieItems: boolean;
  };
}

export default QueueAppState;
