declare namespace MovieSearchInputModuleCssNamespace {
  export interface IMovieSearchInputModuleCss {
    addNewMovieSuggestion: string;
    container: string;
    containerOpen: string;
    highlighted: string;
    input: string;
    list: string;
    listItem: string;
    loading: string;
    movieContainer: string;
    ripple: string;
    sectionContainer: string;
    sectionTitle: string;
    wrapper: string;
  }
}

declare const MovieSearchInputModuleCssModule: MovieSearchInputModuleCssNamespace.IMovieSearchInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieSearchInputModuleCssNamespace.IMovieSearchInputModuleCss;
};

export = MovieSearchInputModuleCssModule;
