declare namespace ManageIndexersEditModalContentCssNamespace {
  export interface IManageIndexersEditModalContentCss {
    modalFooter: string;
    selected: string;
  }
}

declare const ManageIndexersEditModalContentCssModule: ManageIndexersEditModalContentCssNamespace.IManageIndexersEditModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageIndexersEditModalContentCssNamespace.IManageIndexersEditModalContentCss;
};

export = ManageIndexersEditModalContentCssModule;
