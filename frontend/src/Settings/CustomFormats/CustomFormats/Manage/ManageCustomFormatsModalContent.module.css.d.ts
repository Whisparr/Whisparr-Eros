declare namespace ManageCustomFormatsModalContentModuleCssNamespace {
  export interface IManageCustomFormatsModalContentModuleCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageCustomFormatsModalContentModuleCssModule: ManageCustomFormatsModalContentModuleCssNamespace.IManageCustomFormatsModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageCustomFormatsModalContentModuleCssNamespace.IManageCustomFormatsModalContentModuleCss;
};

export = ManageCustomFormatsModalContentModuleCssModule;
