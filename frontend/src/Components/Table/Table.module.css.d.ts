declare namespace TableModuleCssNamespace {
  export interface ITableModuleCss {
    horizontalScroll: string;
    table: string;
    tableContainer: string;
  }
}

declare const TableModuleCssModule: TableModuleCssNamespace.ITableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableModuleCssNamespace.ITableModuleCss;
};

export = TableModuleCssModule;
