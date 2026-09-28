declare namespace EditPerformerModalContentModuleCssNamespace {
  export interface IEditPerformerModalContentModuleCss {
    container: string;
    info: string;
    overview: string;
    poster: string;
  }
}

declare const EditPerformerModalContentModuleCssModule: EditPerformerModalContentModuleCssNamespace.IEditPerformerModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditPerformerModalContentModuleCssNamespace.IEditPerformerModalContentModuleCss;
};

export = EditPerformerModalContentModuleCssModule;
