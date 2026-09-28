declare namespace EditStudioModalContentModuleCssNamespace {
  export interface IEditStudioModalContentModuleCss {
    container: string;
    info: string;
    overview: string;
    poster: string;
  }
}

declare const EditStudioModalContentModuleCssModule: EditStudioModalContentModuleCssNamespace.IEditStudioModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: EditStudioModalContentModuleCssNamespace.IEditStudioModalContentModuleCss;
};

export = EditStudioModalContentModuleCssModule;
