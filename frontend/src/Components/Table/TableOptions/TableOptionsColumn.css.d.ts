declare namespace TableOptionsColumnCssNamespace {
  export interface ITableOptionsColumnCss {
    checkContainer: string;
    column: string;
    columnContainer: string;
    dragHandle: string;
    dragIcon: string;
    isDragging: string;
    label: string;
  }
}

declare const TableOptionsColumnCssModule: TableOptionsColumnCssNamespace.ITableOptionsColumnCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableOptionsColumnCssNamespace.ITableOptionsColumnCss;
};

export = TableOptionsColumnCssModule;
