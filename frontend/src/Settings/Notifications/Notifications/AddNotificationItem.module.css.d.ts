declare namespace AddNotificationItemModuleCssNamespace {
  export interface IAddNotificationItemModuleCss {
    actions: string;
    name: string;
    notification: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
  }
}

declare const AddNotificationItemModuleCssModule: AddNotificationItemModuleCssNamespace.IAddNotificationItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNotificationItemModuleCssNamespace.IAddNotificationItemModuleCss;
};

export = AddNotificationItemModuleCssModule;
