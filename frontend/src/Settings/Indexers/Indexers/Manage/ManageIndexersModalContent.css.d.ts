declare namespace ManageIndexersModalContentCssNamespace {
  export interface IManageIndexersModalContentCss {
    deleteButton: string;
    leftButtons: string;
    rightButtons: string;
  }
}

declare const ManageIndexersModalContentCssModule: ManageIndexersModalContentCssNamespace.IManageIndexersModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageIndexersModalContentCssNamespace.IManageIndexersModalContentCss;
};

export = ManageIndexersModalContentCssModule;
