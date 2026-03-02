declare module '*.module.css';

interface WhisparrGlobal {
  apiKey: string;
  apiRoot: string;
  instanceName: string;
  theme: string;
  urlBase: string;
  version: string;
  isProduction: boolean;
}

interface Window {
  Whisparr: WhisparrGlobal;
}

// eslint-disable-next-line no-var, init-declarations
declare var Whisparr: WhisparrGlobal;
