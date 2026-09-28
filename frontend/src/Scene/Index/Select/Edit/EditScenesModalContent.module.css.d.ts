declare namespace EditScenesModalContentModuleCssNamespace {
  export interface IEditScenesModalContentModuleCss {
    modalFooter: string;
    selected: string;
  }
}

declare const EditScenesModalContentModuleCssModule: EditScenesModalContentModuleCssNamespace.IEditScenesModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditScenesModalContentModuleCssNamespace.IEditScenesModalContentModuleCss;
};

export = EditScenesModalContentModuleCssModule;
