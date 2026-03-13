declare namespace IndexerCssNamespace {
  export interface IIndexerCss {
    cloneButton: string;
    enabled: string;
    indexer: string;
    name: string;
    nameContainer: string;
  }
}

declare const IndexerCssModule: IndexerCssNamespace.IIndexerCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexerCssNamespace.IIndexerCss;
};

export = IndexerCssModule;
