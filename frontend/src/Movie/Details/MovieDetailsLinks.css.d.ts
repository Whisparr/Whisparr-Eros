declare namespace MovieDetailsLinksCssNamespace {
  export interface IMovieDetailsLinksCss {
    link: string;
    linkLabel: string;
    links: string;
  }
}

declare const MovieDetailsLinksCssModule: MovieDetailsLinksCssNamespace.IMovieDetailsLinksCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieDetailsLinksCssNamespace.IMovieDetailsLinksCss;
};

export = MovieDetailsLinksCssModule;
