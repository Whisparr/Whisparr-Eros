declare namespace EditNotificationModalContentModuleCssNamespace {
  export interface IEditNotificationModalContentModuleCss {
    deleteButton: string;
    message: string;
  }
}

declare const EditNotificationModalContentModuleCssModule: EditNotificationModalContentModuleCssNamespace.IEditNotificationModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditNotificationModalContentModuleCssNamespace.IEditNotificationModalContentModuleCss;
};

export = EditNotificationModalContentModuleCssModule;
