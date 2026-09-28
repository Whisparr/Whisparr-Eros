declare namespace AddNotificationModalContentModuleCssNamespace {
  export interface IAddNotificationModalContentModuleCss {
    notifications: string;
  }
}

declare const AddNotificationModalContentModuleCssModule: AddNotificationModalContentModuleCssNamespace.IAddNotificationModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNotificationModalContentModuleCssNamespace.IAddNotificationModalContentModuleCss;
};

export = AddNotificationModalContentModuleCssModule;
