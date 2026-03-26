declare namespace AlertCssNamespace {
  export interface IAlertCss {
    alert: string;
    danger: string;
    info: string;
    success: string;
    warning: string;
  }
}

declare const AlertCssModule: AlertCssNamespace.IAlertCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AlertCssNamespace.IAlertCss;
};

export = AlertCssModule;
