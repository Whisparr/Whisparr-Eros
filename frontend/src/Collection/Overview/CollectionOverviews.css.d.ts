declare namespace CollectionOverviewsCssNamespace {
  export interface ICollectionOverviewsCss {
    container: string;
    content: string;
    externalLinks: string;
    grid: string;
  }
}

declare const CollectionOverviewsCssModule: CollectionOverviewsCssNamespace.ICollectionOverviewsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionOverviewsCssNamespace.ICollectionOverviewsCss;
};

export = CollectionOverviewsCssModule;
