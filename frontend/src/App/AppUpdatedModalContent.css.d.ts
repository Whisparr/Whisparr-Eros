declare namespace AppUpdatedModalContentCssNamespace {
  export interface IAppUpdatedModalContentCss {
    changes: string;
    maintenance: string;
    version: string;
  }
}

declare const AppUpdatedModalContentCssModule: AppUpdatedModalContentCssNamespace.IAppUpdatedModalContentCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AppUpdatedModalContentCssNamespace.IAppUpdatedModalContentCss;
};

export = AppUpdatedModalContentCssModule;
