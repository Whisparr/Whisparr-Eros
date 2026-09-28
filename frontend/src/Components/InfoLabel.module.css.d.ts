declare namespace InfoLabelModuleCssNamespace {
  export interface IInfoLabelModuleCss {
    label: string;
    large: string;
    medium: string;
    name: string;
    outline: string;
    small: string;
  }
}

declare const InfoLabelModuleCssModule: InfoLabelModuleCssNamespace.IInfoLabelModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: InfoLabelModuleCssNamespace.IInfoLabelModuleCss;
};

export = InfoLabelModuleCssModule;
