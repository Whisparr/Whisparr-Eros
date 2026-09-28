declare namespace SettingsModuleCssNamespace {
  export interface ISettingsModuleCss {
    link: string;
    summary: string;
  }
}

declare const SettingsModuleCssModule: SettingsModuleCssNamespace.ISettingsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: SettingsModuleCssNamespace.ISettingsModuleCss;
};

export = SettingsModuleCssModule;
