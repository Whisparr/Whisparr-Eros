declare namespace TableHeaderCellCssNamespace {
  export interface ITableHeaderCellCss {
    headerCell: string;
    sortIcon: string;
  }
}

declare const TableHeaderCellCssModule: TableHeaderCellCssNamespace.ITableHeaderCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableHeaderCellCssNamespace.ITableHeaderCellCss;
};

export = TableHeaderCellCssModule;
