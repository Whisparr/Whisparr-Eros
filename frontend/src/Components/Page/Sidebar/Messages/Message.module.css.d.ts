declare namespace MessageModuleCssNamespace {
  export interface IMessageModuleCss {
    error: string;
    iconContainer: string;
    info: string;
    message: string;
    success: string;
    text: string;
    warning: string;
  }
}

declare const MessageModuleCssModule: MessageModuleCssNamespace.IMessageModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MessageModuleCssNamespace.IMessageModuleCss;
};

export = MessageModuleCssModule;
