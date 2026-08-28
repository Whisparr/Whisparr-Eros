import AppError from 'typings/AppError';
import { ApiError } from 'Utilities/Fetch/fetchJson';

function getErrorMessage(
  error: AppError | ApiError | undefined | null,
  fallbackErrorMessage = ''
) {
  if (!error) {
    return fallbackErrorMessage;
  }

  if (error instanceof ApiError) {
    if (!error.statusBody) {
      return fallbackErrorMessage;
    }

    return error.statusBody.message;
  }

  if (!error.responseJSON) {
    return fallbackErrorMessage;
  }

  if ('message' in error.responseJSON && error.responseJSON.message) {
    return error.responseJSON.message;
  }

  return fallbackErrorMessage;
}

export default getErrorMessage;
