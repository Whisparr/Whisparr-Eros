declare namespace AddNewPerformerModalContentCssNamespace {
  export interface IAddNewPerformerModalContentCss {
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

declare const AddNewPerformerModalContentCssModule: AddNewPerformerModalContentCssNamespace.IAddNewPerformerModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewPerformerModalContentCssNamespace.IAddNewPerformerModalContentCss;
};

export = AddNewPerformerModalContentCssModule;
