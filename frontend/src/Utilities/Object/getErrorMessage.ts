import { ApiError } from 'Utilities/Fetch/fetchJson';

function getErrorMessage(
  error: ApiError | undefined | null,
  fallbackErrorMessage = ''
) {
  if (!error?.statusBody) {
    return fallbackErrorMessage;
  }

  return error.statusBody.message ?? fallbackErrorMessage;
}

export default getErrorMessage;
