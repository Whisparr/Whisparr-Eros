declare namespace TableRowCellModuleCssNamespace {
  export interface ITableRowCellModuleCss {
    cell: string;
  }
}

declare const TableRowCellModuleCssModule: TableRowCellModuleCssNamespace.ITableRowCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowCellModuleCssNamespace.ITableRowCellModuleCss;
};

export = TableRowCellModuleCssModule;
