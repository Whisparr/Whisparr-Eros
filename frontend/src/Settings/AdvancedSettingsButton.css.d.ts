declare namespace AdvancedSettingsButtonCssNamespace {
  export interface IAdvancedSettingsButtonCss {
    button: string;
    disabled: string;
    enabled: string;
    indicatorBackground: string;
    indicatorContainer: string;
    label: string;
    labelContainer: string;
  }
}

declare const AdvancedSettingsButtonCssModule: AdvancedSettingsButtonCssNamespace.IAdvancedSettingsButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AdvancedSettingsButtonCssNamespace.IAdvancedSettingsButtonCss;
};

export = AdvancedSettingsButtonCssModule;
