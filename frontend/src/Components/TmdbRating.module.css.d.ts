declare namespace TmdbRatingModuleCssNamespace {
  export interface ITmdbRatingModuleCss {
    image: string;
  }
}

declare const TmdbRatingModuleCssModule: TmdbRatingModuleCssNamespace.ITmdbRatingModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TmdbRatingModuleCssNamespace.ITmdbRatingModuleCss;
};

export = TmdbRatingModuleCssModule;
