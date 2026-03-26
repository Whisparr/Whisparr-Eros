declare namespace MessagesCssNamespace {
  export interface IMessagesCss {
    messages: string;
  }
}

declare const MessagesCssModule: MessagesCssNamespace.IMessagesCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MessagesCssNamespace.IMessagesCss;
};

export = MessagesCssModule;
