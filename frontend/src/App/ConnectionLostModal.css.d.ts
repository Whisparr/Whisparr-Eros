declare namespace ConnectionLostModalCssNamespace {
  export interface IConnectionLostModalCss {
    automatic: string;
  }
}

declare const ConnectionLostModalCssModule: ConnectionLostModalCssNamespace.IConnectionLostModalCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ConnectionLostModalCssNamespace.IConnectionLostModalCss;
};

export = ConnectionLostModalCssModule;
