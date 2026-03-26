declare namespace EditNotificationModalContentCssNamespace {
  export interface IEditNotificationModalContentCss {
    deleteButton: string;
    message: string;
  }
}

declare const EditNotificationModalContentCssModule: EditNotificationModalContentCssNamespace.IEditNotificationModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditNotificationModalContentCssNamespace.IEditNotificationModalContentCss;
};

export = EditNotificationModalContentCssModule;
