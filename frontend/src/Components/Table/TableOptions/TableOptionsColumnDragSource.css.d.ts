declare namespace TableOptionsColumnDragSourceCssNamespace {
  export interface ITableOptionsColumnDragSourceCss {
    columnDragSource: string;
    columnPlaceholder: string;
    columnPlaceholderAfter: string;
    columnPlaceholderBefore: string;
  }
}

declare const TableOptionsColumnDragSourceCssModule: TableOptionsColumnDragSourceCssNamespace.ITableOptionsColumnDragSourceCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableOptionsColumnDragSourceCssNamespace.ITableOptionsColumnDragSourceCss;
};

export = TableOptionsColumnDragSourceCssModule;
