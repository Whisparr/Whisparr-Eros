declare namespace AlertModuleCssNamespace {
  export interface IAlertModuleCss {
    alert: string;
    danger: string;
    info: string;
    success: string;
    warning: string;
  }
}

declare const AlertModuleCssModule: AlertModuleCssNamespace.IAlertModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AlertModuleCssNamespace.IAlertModuleCss;
};

export = AlertModuleCssModule;
