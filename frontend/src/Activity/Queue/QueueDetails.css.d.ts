declare namespace QueueDetailsCssNamespace {
  export interface IQueueDetailsCss {
    progressBarContainer: string;
  }
}

declare const QueueDetailsCssModule: QueueDetailsCssNamespace.IQueueDetailsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QueueDetailsCssNamespace.IQueueDetailsCss;
};

export = QueueDetailsCssModule;
