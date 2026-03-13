declare namespace NotificationEventItemsCssNamespace {
  export interface INotificationEventItemsCss {
    events: string;
  }
}

declare const NotificationEventItemsCssModule: NotificationEventItemsCssNamespace.INotificationEventItemsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NotificationEventItemsCssNamespace.INotificationEventItemsCss;
};

export = NotificationEventItemsCssModule;
