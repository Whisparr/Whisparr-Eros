declare namespace MovieDetailsLinksCssNamespace {
  export interface IMovieDetailsLinksCss {
    link: string;
    linkBlock: string;
    linkLabel: string;
    links: string;
    soleLinkLabel: string;
  }
}

declare const MovieDetailsLinksCssModule: MovieDetailsLinksCssNamespace.IMovieDetailsLinksCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieDetailsLinksCssNamespace.IMovieDetailsLinksCss;
};

export = MovieDetailsLinksCssModule;
