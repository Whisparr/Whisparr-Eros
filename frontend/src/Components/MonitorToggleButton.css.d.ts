declare namespace MonitorToggleButtonCssNamespace {
  export interface IMonitorToggleButtonCss {
    isDisabled: string;
    toggleButton: string;
  }
}

declare const MonitorToggleButtonCssModule: MonitorToggleButtonCssNamespace.IMonitorToggleButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: MonitorToggleButtonCssNamespace.IMonitorToggleButtonCss;
};

export = MonitorToggleButtonCssModule;
