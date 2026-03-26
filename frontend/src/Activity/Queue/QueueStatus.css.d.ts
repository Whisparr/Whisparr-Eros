declare namespace QueueStatusCssNamespace {
  export interface IQueueStatusCss {
    noMessages: string;
  }
}

declare const QueueStatusCssModule: QueueStatusCssNamespace.IQueueStatusCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueStatusCssNamespace.IQueueStatusCss;
};

export = QueueStatusCssModule;
