declare namespace ProtocolLabelCssNamespace {
  export interface IProtocolLabelCss {
    torrent: string;
    unknown: string;
    usenet: string;
  }
}

declare const ProtocolLabelCssModule: ProtocolLabelCssNamespace.IProtocolLabelCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ProtocolLabelCssNamespace.IProtocolLabelCss;
};

export = ProtocolLabelCssModule;
