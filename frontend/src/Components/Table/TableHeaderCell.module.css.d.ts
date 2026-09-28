declare namespace TableHeaderCellModuleCssNamespace {
  export interface ITableHeaderCellModuleCss {
    headerCell: string;
    sortIcon: string;
  }
}

declare const TableHeaderCellModuleCssModule: TableHeaderCellModuleCssNamespace.ITableHeaderCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableHeaderCellModuleCssNamespace.ITableHeaderCellModuleCss;
};

export = TableHeaderCellModuleCssModule;
