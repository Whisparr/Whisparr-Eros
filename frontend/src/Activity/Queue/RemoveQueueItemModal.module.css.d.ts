declare namespace RemoveQueueItemModalModuleCssNamespace {
  export interface IRemoveQueueItemModalModuleCss {
    message: string;
  }
}

declare const RemoveQueueItemModalModuleCssModule: RemoveQueueItemModalModuleCssNamespace.IRemoveQueueItemModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RemoveQueueItemModalModuleCssNamespace.IRemoveQueueItemModalModuleCss;
};

export = RemoveQueueItemModalModuleCssModule;
