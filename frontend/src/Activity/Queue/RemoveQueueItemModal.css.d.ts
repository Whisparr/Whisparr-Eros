declare namespace RemoveQueueItemModalCssNamespace {
  export interface IRemoveQueueItemModalCss {
    message: string;
  }
}

declare const RemoveQueueItemModalCssModule: RemoveQueueItemModalCssNamespace.IRemoveQueueItemModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RemoveQueueItemModalCssNamespace.IRemoveQueueItemModalCss;
};

export = RemoveQueueItemModalCssModule;
