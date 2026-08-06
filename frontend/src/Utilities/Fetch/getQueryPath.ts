// The single place an API path is assembled. `window.Whisparr.apiRoot` is
// injected by the server as `{urlBase}/api/v3`, so it already carries the url
// base. Never build an API path from parts elsewhere — omitting the url base
// breaks every install behind a reverse proxy.
const getQueryPath = (path: string) => {
  return `${window.Whisparr.apiRoot}${path}`;
};

export default getQueryPath;
