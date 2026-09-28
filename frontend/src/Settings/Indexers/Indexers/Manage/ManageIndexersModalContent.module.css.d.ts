declare namespace ManageIndexersModalContentModuleCssNamespace {
  export interface IManageIndexersModalContentModuleCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageIndexersModalContentModuleCssModule: ManageIndexersModalContentModuleCssNamespace.IManageIndexersModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageIndexersModalContentModuleCssNamespace.IManageIndexersModalContentModuleCss;
};

export = ManageIndexersModalContentModuleCssModule;
