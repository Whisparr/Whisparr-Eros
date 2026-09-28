declare namespace CollectionOverviewsModuleCssNamespace {
  export interface ICollectionOverviewsModuleCss {
    container: string;
    content: string;
    externalLinks: string;
    grid: string;
  }
}

declare const CollectionOverviewsModuleCssModule: CollectionOverviewsModuleCssNamespace.ICollectionOverviewsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CollectionOverviewsModuleCssNamespace.ICollectionOverviewsModuleCss;
};

export = CollectionOverviewsModuleCssModule;
