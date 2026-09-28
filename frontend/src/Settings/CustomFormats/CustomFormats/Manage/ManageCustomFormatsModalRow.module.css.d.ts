declare namespace ManageCustomFormatsModalRowModuleCssNamespace {
  export interface IManageCustomFormatsModalRowModuleCss {
    actions: string;
    includeCustomFormatWhenRenaming: string;
    name: string;
  }
}

declare const ManageCustomFormatsModalRowModuleCssModule: ManageCustomFormatsModalRowModuleCssNamespace.IManageCustomFormatsModalRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageCustomFormatsModalRowModuleCssNamespace.IManageCustomFormatsModalRowModuleCss;
};

export = ManageCustomFormatsModalRowModuleCssModule;
