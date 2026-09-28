declare namespace IndexerModuleCssNamespace {
  export interface IIndexerModuleCss {
    cloneButton: string;
    enabled: string;
    indexer: string;
    name: string;
    nameContainer: string;
  }
}

declare const IndexerModuleCssModule: IndexerModuleCssNamespace.IIndexerModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexerModuleCssNamespace.IIndexerModuleCss;
};

export = IndexerModuleCssModule;
