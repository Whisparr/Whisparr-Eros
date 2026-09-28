declare namespace MessagesModuleCssNamespace {
  export interface IMessagesModuleCss {
    messages: string;
  }
}

declare const MessagesModuleCssModule: MessagesModuleCssNamespace.IMessagesModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MessagesModuleCssNamespace.IMessagesModuleCss;
};

export = MessagesModuleCssModule;
