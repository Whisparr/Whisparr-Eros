declare namespace OverrideMatchModalContentModuleCssNamespace {
  export interface IOverrideMatchModalContentModuleCss {
    buttons: string;
    error: string;
    footer: string;
    item: string;
    label: string;
  }
}

declare const OverrideMatchModalContentModuleCssModule: OverrideMatchModalContentModuleCssNamespace.IOverrideMatchModalContentModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OverrideMatchModalContentModuleCssNamespace.IOverrideMatchModalContentModuleCss;
};

export = OverrideMatchModalContentModuleCssModule;
