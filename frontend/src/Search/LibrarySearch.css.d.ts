declare namespace LibrarySearchCssNamespace {
  export interface ILibrarySearchCss {
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

declare const LibrarySearchCssModule: LibrarySearchCssNamespace.ILibrarySearchCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: LibrarySearchCssNamespace.ILibrarySearchCss;
};

export = LibrarySearchCssModule;
