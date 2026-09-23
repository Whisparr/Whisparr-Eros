declare namespace SearchPosterGridCssNamespace {
  export interface ISearchPosterGridCss {
    grid: string;
  }
}

declare const SearchPosterGridCssModule: SearchPosterGridCssNamespace.ISearchPosterGridCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SearchPosterGridCssNamespace.ISearchPosterGridCss;
};

export = SearchPosterGridCssModule;
