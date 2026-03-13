declare namespace TableOptionsModalCssNamespace {
  export interface ITableOptionsModalCss {
    columns: string;
  }
}

declare const TableOptionsModalCssModule: TableOptionsModalCssNamespace.ITableOptionsModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableOptionsModalCssNamespace.ITableOptionsModalCss;
};

export = TableOptionsModalCssModule;
