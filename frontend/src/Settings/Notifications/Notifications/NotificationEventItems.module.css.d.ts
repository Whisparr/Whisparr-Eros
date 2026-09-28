declare namespace NotificationEventItemsModuleCssNamespace {
  export interface INotificationEventItemsModuleCss {
    events: string;
  }
}

declare const NotificationEventItemsModuleCssModule: NotificationEventItemsModuleCssNamespace.INotificationEventItemsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NotificationEventItemsModuleCssNamespace.INotificationEventItemsModuleCss;
};

export = NotificationEventItemsModuleCssModule;
