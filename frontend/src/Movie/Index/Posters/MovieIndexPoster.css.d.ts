declare namespace MovieIndexPosterCssNamespace {
  export interface IMovieIndexPosterCss {
    action: string;
    container: string;
    content: string;
    controls: string;
    deleted: string;
    editorSelect: string;
    externalLinks: string;
    link: string;
    nextAiring: string;
    overlayTitle: string;
    poster: string;
    posterContainer: string;
    tags: string;
    tagsList: string;
    title: string;
  }
}

declare const MovieIndexPosterCssModule: MovieIndexPosterCssNamespace.IMovieIndexPosterCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieIndexPosterCssNamespace.IMovieIndexPosterCss;
};

export = MovieIndexPosterCssModule;
