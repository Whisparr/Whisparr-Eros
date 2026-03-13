declare namespace NotificationCssNamespace {
  export interface INotificationCss {
    enabled: string;
    name: string;
    notification: string;
  }
}

declare const NotificationCssModule: NotificationCssNamespace.INotificationCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NotificationCssNamespace.INotificationCss;
};

export = NotificationCssModule;
