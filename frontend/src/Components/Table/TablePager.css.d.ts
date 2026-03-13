declare namespace TablePagerCssNamespace {
  export interface ITablePagerCss {
    controls: string;
    controlsContainer: string;
    disabledPageButton: string;
    loading: string;
    loadingContainer: string;
    pageLink: string;
    pageNumber: string;
    pageSelect: string;
    pager: string;
    records: string;
    recordsContainer: string;
  }
}

declare const TablePagerCssModule: TablePagerCssNamespace.ITablePagerCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TablePagerCssNamespace.ITablePagerCss;
};

export = TablePagerCssModule;
