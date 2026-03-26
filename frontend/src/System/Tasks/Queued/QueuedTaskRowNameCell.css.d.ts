declare namespace QueuedTaskRowNameCellCssNamespace {
  export interface IQueuedTaskRowNameCellCss {
    commandName: string;
    userAgent: string;
  }
}

declare const QueuedTaskRowNameCellCssModule: QueuedTaskRowNameCellCssNamespace.IQueuedTaskRowNameCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueuedTaskRowNameCellCssNamespace.IQueuedTaskRowNameCellCss;
};

export = QueuedTaskRowNameCellCssModule;
