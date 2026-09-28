declare namespace QueueDetailsModuleCssNamespace {
  export interface IQueueDetailsModuleCss {
    progressBarContainer: string;
  }
}

declare const QueueDetailsModuleCssModule: QueueDetailsModuleCssNamespace.IQueueDetailsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueDetailsModuleCssNamespace.IQueueDetailsModuleCss;
};

export = QueueDetailsModuleCssModule;
