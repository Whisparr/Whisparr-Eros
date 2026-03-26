declare namespace MessageCssNamespace {
  export interface IMessageCss {
    error: string;
    iconContainer: string;
    info: string;
    message: string;
    success: string;
    text: string;
    warning: string;
  }
}

declare const MessageCssModule: MessageCssNamespace.IMessageCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MessageCssNamespace.IMessageCss;
};

export = MessageCssModule;
