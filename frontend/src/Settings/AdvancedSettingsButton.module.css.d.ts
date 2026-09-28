declare namespace AdvancedSettingsButtonModuleCssNamespace {
  export interface IAdvancedSettingsButtonModuleCss {
    button: string;
    disabled: string;
    enabled: string;
    indicatorBackground: string;
    indicatorContainer: string;
    label: string;
    labelContainer: string;
  }
}

declare const AdvancedSettingsButtonModuleCssModule: AdvancedSettingsButtonModuleCssNamespace.IAdvancedSettingsButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AdvancedSettingsButtonModuleCssNamespace.IAdvancedSettingsButtonModuleCss;
};

export = AdvancedSettingsButtonModuleCssModule;
