declare namespace AddNewMovieModalContentModuleCssNamespace {
  export interface IAddNewMovieModalContentModuleCss {
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

declare const AddNewMovieModalContentModuleCssModule: AddNewMovieModalContentModuleCssNamespace.IAddNewMovieModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewMovieModalContentModuleCssNamespace.IAddNewMovieModalContentModuleCss;
};

export = AddNewMovieModalContentModuleCssModule;
