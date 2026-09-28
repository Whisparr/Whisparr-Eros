declare namespace InteractiveSearchRowModuleCssNamespace {
  export interface IInteractiveSearchRowModuleCss {
    age: string;
    blocklist: string;
    customFormatScore: string;
    download: string;
    downloadIcon: string;
    exclusion: string;
    history: string;
    indexer: string;
    indexerFlags: string;
    interactiveIcon: string;
    languages: string;
    manualDownloadContent: string;
    peers: string;
    protocol: string;
    quality: string;
    rejected: string;
    size: string;
    titleContent: string;
  }
}

declare const InteractiveSearchRowModuleCssModule: InteractiveSearchRowModuleCssNamespace.IInteractiveSearchRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveSearchRowModuleCssNamespace.IInteractiveSearchRowModuleCss;
};

export = InteractiveSearchRowModuleCssModule;
