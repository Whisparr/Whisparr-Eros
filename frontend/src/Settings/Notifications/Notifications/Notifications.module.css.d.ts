declare namespace NotificationsModuleCssNamespace {
  export interface INotificationsModuleCss {
    addNotification: string;
    center: string;
    notifications: string;
  }
}

declare const NotificationsModuleCssModule: NotificationsModuleCssNamespace.INotificationsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: NotificationsModuleCssNamespace.INotificationsModuleCss;
};

export = NotificationsModuleCssModule;
