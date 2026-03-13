declare namespace HealthCssNamespace {
  export interface IHealthCss {
    actions: string;
    healthOk: string;
    legend: string;
    loading: string;
    status: string;
  }
}

declare const HealthCssModule: HealthCssNamespace.IHealthCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HealthCssNamespace.IHealthCss;
};

export = HealthCssModule;
