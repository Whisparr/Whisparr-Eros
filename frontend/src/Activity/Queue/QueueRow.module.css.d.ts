declare namespace QueueRowModuleCssNamespace {
  export interface IQueueRowModuleCss {
    actions: string;
    customFormatScore: string;
    progress: string;
    protocol: string;
    quality: string;
  }
}

declare const QueueRowModuleCssModule: QueueRowModuleCssNamespace.IQueueRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueRowModuleCssNamespace.IQueueRowModuleCss;
};

export = QueueRowModuleCssModule;
