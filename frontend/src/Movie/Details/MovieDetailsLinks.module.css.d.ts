declare namespace MovieDetailsLinksModuleCssNamespace {
  export interface IMovieDetailsLinksModuleCss {
    link: string;
    linkBlock: string;
    linkLabel: string;
    links: string;
    soleLinkLabel: string;
  }
}

declare const MovieDetailsLinksModuleCssModule: MovieDetailsLinksModuleCssNamespace.IMovieDetailsLinksModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieDetailsLinksModuleCssNamespace.IMovieDetailsLinksModuleCss;
};

export = MovieDetailsLinksModuleCssModule;
