declare namespace EditStudiosModalContentModuleCssNamespace {
  export interface IEditStudiosModalContentModuleCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditStudiosModalContentModuleCssModule: EditStudiosModalContentModuleCssNamespace.IEditStudiosModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditStudiosModalContentModuleCssNamespace.IEditStudiosModalContentModuleCss;
};

export = EditStudiosModalContentModuleCssModule;
