declare namespace OverrideMatchDataModuleCssNamespace {
  export interface IOverrideMatchDataModuleCss {
    link: string;
    optional: string;
    placeholder: string;
  }
}

declare const OverrideMatchDataModuleCssModule: OverrideMatchDataModuleCssNamespace.IOverrideMatchDataModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OverrideMatchDataModuleCssNamespace.IOverrideMatchDataModuleCss;
};

export = OverrideMatchDataModuleCssModule;
