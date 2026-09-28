declare namespace TableOptionsModalModuleCssNamespace {
  export interface ITableOptionsModalModuleCss {
    columns: string;
  }
}

declare const TableOptionsModalModuleCssModule: TableOptionsModalModuleCssNamespace.ITableOptionsModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableOptionsModalModuleCssNamespace.ITableOptionsModalModuleCss;
};

export = TableOptionsModalModuleCssModule;
