declare namespace ManageCustomFormatsModalRowCssNamespace {
  export interface IManageCustomFormatsModalRowCss {
    actions: string;
    includeCustomFormatWhenRenaming: string;
    name: string;
  }
}

declare const ManageCustomFormatsModalRowCssModule: ManageCustomFormatsModalRowCssNamespace.IManageCustomFormatsModalRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageCustomFormatsModalRowCssNamespace.IManageCustomFormatsModalRowCss;
};

export = ManageCustomFormatsModalRowCssModule;
