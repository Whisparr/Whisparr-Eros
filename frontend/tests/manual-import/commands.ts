import getQueryPath from 'Utilities/Fetch/getQueryPath';

// Command writes are captured by the browser fixture, never sent to an application.
export const useExecuteCommand = () => (body: unknown) =>
  fetch(getQueryPath('/command'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
