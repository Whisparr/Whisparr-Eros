declare namespace AddNewStudioSearchResultModuleCssNamespace {
  export interface IAddNewStudioSearchResultModuleCss {
    alreadyExistsIcon: string;
    content: string;
    exclusionIcon: string;
    icons: string;
    links: string;
    network: string;
    overlay: string;
    overview: string;
    poster: string;
    posterContainer: string;
    runtime: string;
    searchResult: string;
    statusContainer: string;
    studio: string;
    title: string;
    titleContainer: string;
    titleRow: string;
    underlay: string;
    year: string;
  }
}

declare const AddNewStudioSearchResultModuleCssModule: AddNewStudioSearchResultModuleCssNamespace.IAddNewStudioSearchResultModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNewStudioSearchResultModuleCssNamespace.IAddNewStudioSearchResultModuleCss;
};

export = AddNewStudioSearchResultModuleCssModule;
