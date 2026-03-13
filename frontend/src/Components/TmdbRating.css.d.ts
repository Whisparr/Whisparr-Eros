declare namespace TmdbRatingCssNamespace {
  export interface ITmdbRatingCss {
    image: string;
  }
}

declare const TmdbRatingCssModule: TmdbRatingCssNamespace.ITmdbRatingCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TmdbRatingCssNamespace.ITmdbRatingCss;
};

export = TmdbRatingCssModule;
