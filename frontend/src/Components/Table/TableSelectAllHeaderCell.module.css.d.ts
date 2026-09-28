declare namespace TableSelectAllHeaderCellModuleCssNamespace {
  export interface ITableSelectAllHeaderCellModuleCss {
    input: string;
    selectAllHeaderCell: string;
  }
}

declare const TableSelectAllHeaderCellModuleCssModule: TableSelectAllHeaderCellModuleCssNamespace.ITableSelectAllHeaderCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableSelectAllHeaderCellModuleCssNamespace.ITableSelectAllHeaderCellModuleCss;
};

export = TableSelectAllHeaderCellModuleCssModule;
