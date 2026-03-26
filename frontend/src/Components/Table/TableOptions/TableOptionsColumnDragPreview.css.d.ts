declare namespace TableOptionsColumnDragPreviewCssNamespace {
  export interface ITableOptionsColumnDragPreviewCss {
    dragPreview: string;
  }
}

declare const TableOptionsColumnDragPreviewCssModule: TableOptionsColumnDragPreviewCssNamespace.ITableOptionsColumnDragPreviewCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: TableOptionsColumnDragPreviewCssNamespace.ITableOptionsColumnDragPreviewCss;
};

export = TableOptionsColumnDragPreviewCssModule;
