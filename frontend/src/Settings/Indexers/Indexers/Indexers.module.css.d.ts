declare namespace IndexersModuleCssNamespace {
  export interface IIndexersModuleCss {
    addIndexer: string;
    center: string;
    indexers: string;
  }
}

declare const IndexersModuleCssModule: IndexersModuleCssNamespace.IIndexersModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: IndexersModuleCssNamespace.IIndexersModuleCss;
};

export = IndexersModuleCssModule;
