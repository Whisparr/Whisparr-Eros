declare namespace AddNewMovieModalContentCssNamespace {
  export interface IAddNewMovieModalContentCss {
    addButton: string;
    container: string;
    info: string;
    labelIcon: string;
    modalFooter: string;
    overview: string;
    poster: string;
    screenShot: string;
    searchForMissingMovieContainer: string;
    searchForMissingMovieInput: string;
    searchForMissingMovieLabel: string;
    searchForMissingMovieLabelContainer: string;
    year: string;
  }
}

declare const AddNewMovieModalContentCssModule: AddNewMovieModalContentCssNamespace.IAddNewMovieModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewMovieModalContentCssNamespace.IAddNewMovieModalContentCss;
};

export = AddNewMovieModalContentCssModule;
