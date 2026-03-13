declare namespace QueueStatusCellCssNamespace {
  export interface IQueueStatusCellCss {
    status: string;
  }
}

declare const QueueStatusCellCssModule: QueueStatusCellCssNamespace.IQueueStatusCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueStatusCellCssNamespace.IQueueStatusCellCss;
};

export = QueueStatusCellCssModule;
