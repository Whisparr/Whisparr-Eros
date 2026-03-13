declare namespace TableRowCssNamespace {
  export interface ITableRowCss {
    row: string;
  }
}

declare const TableRowCssModule: TableRowCssNamespace.ITableRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowCssNamespace.ITableRowCss;
};

export = TableRowCssModule;
