declare namespace AddNotificationItemCssNamespace {
  export interface IAddNotificationItemCss {
    actions: string;
    name: string;
    notification: string;
    overlay: string;
    presetsMenu: string;
    presetsMenuButton: string;
  }
}

declare const AddNotificationItemCssModule: AddNotificationItemCssNamespace.IAddNotificationItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AddNotificationItemCssNamespace.IAddNotificationItemCss;
};

export = AddNotificationItemCssModule;
