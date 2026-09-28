declare namespace QueueStatusCellModuleCssNamespace {
  export interface IQueueStatusCellModuleCss {
    status: string;
  }
}

declare const QueueStatusCellModuleCssModule: QueueStatusCellModuleCssNamespace.IQueueStatusCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueStatusCellModuleCssNamespace.IQueueStatusCellModuleCss;
};

export = QueueStatusCellModuleCssModule;
