declare namespace AddNotificationModalContentCssNamespace {
  export interface IAddNotificationModalContentCss {
    notifications: string;
  }
}

declare const AddNotificationModalContentCssModule: AddNotificationModalContentCssNamespace.IAddNotificationModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNotificationModalContentCssNamespace.IAddNotificationModalContentCss;
};

export = AddNotificationModalContentCssModule;
