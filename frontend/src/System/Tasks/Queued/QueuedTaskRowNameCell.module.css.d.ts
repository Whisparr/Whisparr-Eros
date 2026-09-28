declare namespace QueuedTaskRowNameCellModuleCssNamespace {
  export interface IQueuedTaskRowNameCellModuleCss {
    commandName: string;
    userAgent: string;
  }
}

declare const QueuedTaskRowNameCellModuleCssModule: QueuedTaskRowNameCellModuleCssNamespace.IQueuedTaskRowNameCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueuedTaskRowNameCellModuleCssNamespace.IQueuedTaskRowNameCellModuleCss;
};

export = QueuedTaskRowNameCellModuleCssModule;
