declare namespace MovieImageModuleCssNamespace {
  export interface IMovieImageModuleCss {
    blur: string;
    container: string;
    image: string;
  }
}

declare const MovieImageModuleCssModule: MovieImageModuleCssNamespace.IMovieImageModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieImageModuleCssNamespace.IMovieImageModuleCss;
};

export = MovieImageModuleCssModule;
