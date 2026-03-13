declare namespace TableCssNamespace {
  export interface ITableCss {
    horizontalScroll: string;
    table: string;
    tableContainer: string;
  }
}

declare const TableCssModule: TableCssNamespace.ITableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableCssNamespace.ITableCss;
};

export = TableCssModule;
