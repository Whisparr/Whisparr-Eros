declare namespace TableRowButtonCssNamespace {
  export interface ITableRowButtonCss {
    row: string;
  }
}

declare const TableRowButtonCssModule: TableRowButtonCssNamespace.ITableRowButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableRowButtonCssNamespace.ITableRowButtonCss;
};

export = TableRowButtonCssModule;
