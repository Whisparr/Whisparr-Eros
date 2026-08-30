declare namespace TableRowCellButtonCssNamespace {
  export interface ITableRowCellButtonCss {
    button: string;
    cell: string;
  }
}

declare const TableRowCellButtonCssModule: TableRowCellButtonCssNamespace.ITableRowCellButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowCellButtonCssNamespace.ITableRowCellButtonCss;
};

export = TableRowCellButtonCssModule;
