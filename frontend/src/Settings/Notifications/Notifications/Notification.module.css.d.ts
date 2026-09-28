declare namespace NotificationModuleCssNamespace {
  export interface INotificationModuleCss {
    enabled: string;
    name: string;
    notification: string;
  }
}

declare const NotificationModuleCssModule: NotificationModuleCssNamespace.INotificationModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NotificationModuleCssNamespace.INotificationModuleCss;
};

export = NotificationModuleCssModule;
