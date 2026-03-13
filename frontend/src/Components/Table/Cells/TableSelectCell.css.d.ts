declare namespace TableSelectCellCssNamespace {
  export interface ITableSelectCellCss {
    input: string;
    selectCell: string;
  }
}

declare const TableSelectCellCssModule: TableSelectCellCssNamespace.ITableSelectCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableSelectCellCssNamespace.ITableSelectCellCss;
};

export = TableSelectCellCssModule;
