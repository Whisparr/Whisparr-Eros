declare namespace TableRowButtonModuleCssNamespace {
  export interface ITableRowButtonModuleCss {
    row: string;
  }
}

declare const TableRowButtonModuleCssModule: TableRowButtonModuleCssNamespace.ITableRowButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowButtonModuleCssNamespace.ITableRowButtonModuleCss;
};

export = TableRowButtonModuleCssModule;
