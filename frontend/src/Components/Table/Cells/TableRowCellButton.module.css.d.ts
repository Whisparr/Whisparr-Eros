declare namespace TableRowCellButtonModuleCssNamespace {
  export interface ITableRowCellButtonModuleCss {
    button: string;
    cell: string;
  }
}

declare const TableRowCellButtonModuleCssModule: TableRowCellButtonModuleCssNamespace.ITableRowCellButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowCellButtonModuleCssNamespace.ITableRowCellButtonModuleCss;
};

export = TableRowCellButtonModuleCssModule;
