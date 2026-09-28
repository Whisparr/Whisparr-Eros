declare namespace ConnectionLostModalModuleCssNamespace {
  export interface IConnectionLostModalModuleCss {
    automatic: string;
  }
}

declare const ConnectionLostModalModuleCssModule: ConnectionLostModalModuleCssNamespace.IConnectionLostModalModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ConnectionLostModalModuleCssNamespace.IConnectionLostModalModuleCss;
};

export = ConnectionLostModalModuleCssModule;
