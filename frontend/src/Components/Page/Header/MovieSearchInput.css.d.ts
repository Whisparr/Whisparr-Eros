declare namespace MovieSearchInputCssNamespace {
  export interface IMovieSearchInputCss {
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

declare const MovieSearchInputCssModule: MovieSearchInputCssNamespace.IMovieSearchInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MovieSearchInputCssNamespace.IMovieSearchInputCss;
};

export = MovieSearchInputCssModule;
