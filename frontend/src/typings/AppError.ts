import { ValidationFailure } from 'typings/pending';

// The failure shape `createAjaxRequest` produces -- jQuery's, not `fetch`'s.
// React Query paths throw `Utilities/Fetch/fetchJson`'s `ApiError` instead;
// the two meet in the components that render either.
interface AppError {
  status?: number;
  responseJSON:
    | {
        message: string | undefined;
      }
    | ValidationFailure[]
    | undefined;
}

export default AppError;
