declare namespace InteractiveSearchRowCssNamespace {
  export interface IInteractiveSearchRowCss {
    age: string;
    blocklist: string;
    customFormatScore: string;
    download: string;
    downloadIcon: string;
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

declare const InteractiveSearchRowCssModule: InteractiveSearchRowCssNamespace.IInteractiveSearchRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InteractiveSearchRowCssNamespace.IInteractiveSearchRowCss;
};

export = InteractiveSearchRowCssModule;
