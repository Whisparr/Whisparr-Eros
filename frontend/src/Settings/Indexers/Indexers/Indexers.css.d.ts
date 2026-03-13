declare namespace IndexersCssNamespace {
  export interface IIndexersCss {
    addIndexer: string;
    center: string;
    indexers: string;
  }
}

declare const IndexersCssModule: IndexersCssNamespace.IIndexersCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexersCssNamespace.IIndexersCss;
};

export = IndexersCssModule;
