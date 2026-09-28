declare namespace HealthModuleCssNamespace {
  export interface IHealthModuleCss {
    actions: string;
    healthOk: string;
    legend: string;
    loading: string;
    status: string;
  }
}

declare const HealthModuleCssModule: HealthModuleCssNamespace.IHealthModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HealthModuleCssNamespace.IHealthModuleCss;
};

export = HealthModuleCssModule;
