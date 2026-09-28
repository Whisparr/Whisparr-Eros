declare namespace TableOptionsColumnModuleCssNamespace {
  export interface ITableOptionsColumnModuleCss {
    checkContainer: string;
    column: string;
    columnContainer: string;
    dragHandle: string;
    dragIcon: string;
    isDragging: string;
    label: string;
  }
}

declare const TableOptionsColumnModuleCssModule: TableOptionsColumnModuleCssNamespace.ITableOptionsColumnModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableOptionsColumnModuleCssNamespace.ITableOptionsColumnModuleCss;
};

export = TableOptionsColumnModuleCssModule;
