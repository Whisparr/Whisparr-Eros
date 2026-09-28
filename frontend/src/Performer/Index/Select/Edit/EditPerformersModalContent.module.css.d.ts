declare namespace EditPerformersModalContentModuleCssNamespace {
  export interface IEditPerformersModalContentModuleCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditPerformersModalContentModuleCssModule: EditPerformersModalContentModuleCssNamespace.IEditPerformersModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditPerformersModalContentModuleCssNamespace.IEditPerformersModalContentModuleCss;
};

export = EditPerformersModalContentModuleCssModule;
