declare namespace TableRowCellCssNamespace {
  export interface ITableRowCellCss {
    cell: string;
  }
}

declare const TableRowCellCssModule: TableRowCellCssNamespace.ITableRowCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowCellCssNamespace.ITableRowCellCss;
};

export = TableRowCellCssModule;
