declare namespace ManageCustomFormatsModalContentCssNamespace {
  export interface IManageCustomFormatsModalContentCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageCustomFormatsModalContentCssModule: ManageCustomFormatsModalContentCssNamespace.IManageCustomFormatsModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageCustomFormatsModalContentCssNamespace.IManageCustomFormatsModalContentCss;
};

export = ManageCustomFormatsModalContentCssModule;
