declare namespace ManageCustomFormatsEditModalContentCssNamespace {
  export interface IManageCustomFormatsEditModalContentCss {
    modalFooter: string;
    selected: string;
  }
}

declare const ManageCustomFormatsEditModalContentCssModule: ManageCustomFormatsEditModalContentCssNamespace.IManageCustomFormatsEditModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ManageCustomFormatsEditModalContentCssNamespace.IManageCustomFormatsEditModalContentCss;
};

export = ManageCustomFormatsEditModalContentCssModule;
