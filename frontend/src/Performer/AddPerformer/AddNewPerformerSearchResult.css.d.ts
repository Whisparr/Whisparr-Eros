declare namespace AddNewPerformerSearchResultCssNamespace {
  export interface IAddNewPerformerSearchResultCss {
    alreadyExistsIcon: string;
    content: string;
    country: string;
    exclusionIcon: string;
    gender: string;
    genderIcon: string;
    icons: string;
    links: string;
    overlay: string;
    overview: string;
    poster: string;
    posterContainer: string;
    runtime: string;
    searchResult: string;
    statusContainer: string;
    title: string;
    titleContainer: string;
    titleRow: string;
    underlay: string;
    year: string;
  }
}

declare const AddNewPerformerSearchResultCssModule: AddNewPerformerSearchResultCssNamespace.IAddNewPerformerSearchResultCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewPerformerSearchResultCssNamespace.IAddNewPerformerSearchResultCss;
};

export = AddNewPerformerSearchResultCssModule;
