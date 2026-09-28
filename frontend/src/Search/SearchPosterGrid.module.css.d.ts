declare namespace SearchPosterGridModuleCssNamespace {
  export interface ISearchPosterGridModuleCss {
    grid: string;
  }
}

declare const SearchPosterGridModuleCssModule: SearchPosterGridModuleCssNamespace.ISearchPosterGridModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SearchPosterGridModuleCssNamespace.ISearchPosterGridModuleCss;
};

export = SearchPosterGridModuleCssModule;
