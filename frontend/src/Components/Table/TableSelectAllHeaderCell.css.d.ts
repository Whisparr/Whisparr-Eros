declare namespace TableSelectAllHeaderCellCssNamespace {
  export interface ITableSelectAllHeaderCellCss {
    input: string;
    selectAllHeaderCell: string;
  }
}

declare const TableSelectAllHeaderCellCssModule: TableSelectAllHeaderCellCssNamespace.ITableSelectAllHeaderCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableSelectAllHeaderCellCssNamespace.ITableSelectAllHeaderCellCss;
};

export = TableSelectAllHeaderCellCssModule;
