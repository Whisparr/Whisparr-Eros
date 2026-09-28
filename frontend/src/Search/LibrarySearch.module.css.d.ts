declare namespace LibrarySearchModuleCssNamespace {
  export interface ILibrarySearchModuleCss {
    addLinks: string;
    count: string;
    message: string;
    section: string;
    sectionHeader: string;
    seeAll: string;
    selectedTab: string;
    summary: string;
    tab: string;
    tabList: string;
  }
}

declare const LibrarySearchModuleCssModule: LibrarySearchModuleCssNamespace.ILibrarySearchModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LibrarySearchModuleCssNamespace.ILibrarySearchModuleCss;
};

export = LibrarySearchModuleCssModule;
