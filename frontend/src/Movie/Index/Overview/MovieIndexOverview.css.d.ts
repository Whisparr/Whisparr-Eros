declare namespace MovieIndexOverviewCssNamespace {
  export interface IMovieIndexOverviewCss {
    actions: string;
    content: string;
    controls: string;
    deleted: string;
    details: string;
    editorSelect: string;
    externalLinks: string;
    info: string;
    link: string;
    overview: string;
    overviewContainer: string;
    poster: string;
    posterContainer: string;
    queue: string;
    tags: string;
    title: string;
    titleRow: string;
  }
}

declare const MovieIndexOverviewCssModule: MovieIndexOverviewCssNamespace.IMovieIndexOverviewCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexOverviewCssNamespace.IMovieIndexOverviewCss;
};

export = MovieIndexOverviewCssModule;
