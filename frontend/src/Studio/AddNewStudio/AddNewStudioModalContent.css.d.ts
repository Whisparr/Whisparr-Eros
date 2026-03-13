declare namespace AddNewStudioModalContentCssNamespace {
  export interface IAddNewStudioModalContentCss {
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

declare const AddNewStudioModalContentCssModule: AddNewStudioModalContentCssNamespace.IAddNewStudioModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewStudioModalContentCssNamespace.IAddNewStudioModalContentCss;
};

export = AddNewStudioModalContentCssModule;
