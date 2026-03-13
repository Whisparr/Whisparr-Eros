declare namespace QueueRowCssNamespace {
  export interface IQueueRowCss {
    actions: string;
    customFormatScore: string;
    progress: string;
    protocol: string;
    quality: string;
  }
}

declare const QueueRowCssModule: QueueRowCssNamespace.IQueueRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueRowCssNamespace.IQueueRowCss;
};

export = QueueRowCssModule;
