declare namespace TablePagerModuleCssNamespace {
  export interface ITablePagerModuleCss {
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

declare const TablePagerModuleCssModule: TablePagerModuleCssNamespace.ITablePagerModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TablePagerModuleCssNamespace.ITablePagerModuleCss;
};

export = TablePagerModuleCssModule;
