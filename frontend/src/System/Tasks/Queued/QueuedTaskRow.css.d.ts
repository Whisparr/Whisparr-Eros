declare namespace QueuedTaskRowCssNamespace {
  export interface IQueuedTaskRowCss {
    actions: string;
    duration: string;
    ended: string;
    queued: string;
    started: string;
    trigger: string;
    triggerContent: string;
  }
}

declare const QueuedTaskRowCssModule: QueuedTaskRowCssNamespace.IQueuedTaskRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueuedTaskRowCssNamespace.IQueuedTaskRowCss;
};

export = QueuedTaskRowCssModule;
