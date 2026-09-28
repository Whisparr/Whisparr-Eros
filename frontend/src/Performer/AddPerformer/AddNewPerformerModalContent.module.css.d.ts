declare namespace AddNewPerformerModalContentModuleCssNamespace {
  export interface IAddNewPerformerModalContentModuleCss {
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

declare const AddNewPerformerModalContentModuleCssModule: AddNewPerformerModalContentModuleCssNamespace.IAddNewPerformerModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewPerformerModalContentModuleCssNamespace.IAddNewPerformerModalContentModuleCss;
};

export = AddNewPerformerModalContentModuleCssModule;
