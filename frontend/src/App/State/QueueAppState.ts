import Queue from 'typings/Queue';
import AppSectionState, {
  AppSectionFilterState,
  Error,
  PagedAppSectionState,
  TableAppSectionState,
} from './AppSectionState';

export interface QueueDetailsAppState extends AppSectionState<Queue> {
  params: unknown;
}

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
  details: QueueDetailsAppState;
  paged: QueuePagedAppState;
  options: {
    includeUnknownMovieItems: boolean;
  };
}

export default QueueAppState;
