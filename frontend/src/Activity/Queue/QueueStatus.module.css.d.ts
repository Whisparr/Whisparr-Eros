declare namespace QueueStatusModuleCssNamespace {
  export interface IQueueStatusModuleCss {
    noMessages: string;
  }
}

declare const QueueStatusModuleCssModule: QueueStatusModuleCssNamespace.IQueueStatusModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueStatusModuleCssNamespace.IQueueStatusModuleCss;
};

export = QueueStatusModuleCssModule;
