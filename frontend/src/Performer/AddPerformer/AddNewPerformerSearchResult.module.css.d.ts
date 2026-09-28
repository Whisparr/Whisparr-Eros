declare namespace AddNewPerformerSearchResultModuleCssNamespace {
  export interface IAddNewPerformerSearchResultModuleCss {
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

declare const AddNewPerformerSearchResultModuleCssModule: AddNewPerformerSearchResultModuleCssNamespace.IAddNewPerformerSearchResultModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewPerformerSearchResultModuleCssNamespace.IAddNewPerformerSearchResultModuleCss;
};

export = AddNewPerformerSearchResultModuleCssModule;
