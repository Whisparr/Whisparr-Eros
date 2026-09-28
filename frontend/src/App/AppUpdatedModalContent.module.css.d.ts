declare namespace AppUpdatedModalContentModuleCssNamespace {
  export interface IAppUpdatedModalContentModuleCss {
    changes: string;
    maintenance: string;
    version: string;
  }
}

declare const AppUpdatedModalContentModuleCssModule: AppUpdatedModalContentModuleCssNamespace.IAppUpdatedModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AppUpdatedModalContentModuleCssNamespace.IAppUpdatedModalContentModuleCss;
};

export = AppUpdatedModalContentModuleCssModule;
