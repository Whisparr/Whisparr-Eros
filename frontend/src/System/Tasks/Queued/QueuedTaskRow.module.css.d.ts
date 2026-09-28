declare namespace QueuedTaskRowModuleCssNamespace {
  export interface IQueuedTaskRowModuleCss {
    actions: string;
    duration: string;
    ended: string;
    queued: string;
    started: string;
    trigger: string;
    triggerContent: string;
  }
}

declare const QueuedTaskRowModuleCssModule: QueuedTaskRowModuleCssNamespace.IQueuedTaskRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueuedTaskRowModuleCssNamespace.IQueuedTaskRowModuleCss;
};

export = QueuedTaskRowModuleCssModule;
