declare namespace AddNewMovieCollectionMovieModalContentModuleCssNamespace {
  export interface IAddNewMovieCollectionMovieModalContentModuleCss {
    addButton: string;
    container: string;
    info: string;
    labelIcon: string;
    modalFooter: string;
    overview: string;
    poster: string;
    searchForMissingMovieContainer: string;
    searchForMissingMovieInput: string;
    searchForMissingMovieLabel: string;
    searchForMissingMovieLabelContainer: string;
    year: string;
  }
}

declare const AddNewMovieCollectionMovieModalContentModuleCssModule: AddNewMovieCollectionMovieModalContentModuleCssNamespace.IAddNewMovieCollectionMovieModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewMovieCollectionMovieModalContentModuleCssNamespace.IAddNewMovieCollectionMovieModalContentModuleCss;
};

export = AddNewMovieCollectionMovieModalContentModuleCssModule;
