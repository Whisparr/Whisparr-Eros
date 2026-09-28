declare namespace TableSelectCellModuleCssNamespace {
  export interface ITableSelectCellModuleCss {
    input: string;
    selectCell: string;
  }
}

declare const TableSelectCellModuleCssModule: TableSelectCellModuleCssNamespace.ITableSelectCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableSelectCellModuleCssNamespace.ITableSelectCellModuleCss;
};

export = TableSelectCellModuleCssModule;
