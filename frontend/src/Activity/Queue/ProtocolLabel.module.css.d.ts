declare namespace ProtocolLabelModuleCssNamespace {
  export interface IProtocolLabelModuleCss {
    torrent: string;
    unknown: string;
    usenet: string;
  }
}

declare const ProtocolLabelModuleCssModule: ProtocolLabelModuleCssNamespace.IProtocolLabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ProtocolLabelModuleCssNamespace.IProtocolLabelModuleCss;
};

export = ProtocolLabelModuleCssModule;
