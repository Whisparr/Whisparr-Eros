declare namespace TableRowModuleCssNamespace {
  export interface ITableRowModuleCss {
    row: string;
  }
}

declare const TableRowModuleCssModule: TableRowModuleCssNamespace.ITableRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowModuleCssNamespace.ITableRowModuleCss;
};

export = TableRowModuleCssModule;
