declare namespace MonitorToggleButtonModuleCssNamespace {
  export interface IMonitorToggleButtonModuleCss {
    isDisabled: string;
    toggleButton: string;
  }
}

declare const MonitorToggleButtonModuleCssModule: MonitorToggleButtonModuleCssNamespace.IMonitorToggleButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MonitorToggleButtonModuleCssNamespace.IMonitorToggleButtonModuleCss;
};

export = MonitorToggleButtonModuleCssModule;
