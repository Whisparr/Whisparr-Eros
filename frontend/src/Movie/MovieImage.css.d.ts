declare namespace MovieImageCssNamespace {
  export interface IMovieImageCss {
    blur: string;
    container: string;
    image: string;
  }
}

declare const MovieImageCssModule: MovieImageCssNamespace.IMovieImageCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieImageCssNamespace.IMovieImageCss;
};

export = MovieImageCssModule;
