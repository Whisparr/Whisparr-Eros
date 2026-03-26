declare namespace OverrideMatchDataCssNamespace {
  export interface IOverrideMatchDataCss {
    link: string;
    optional: string;
    placeholder: string;
  }
}

declare const OverrideMatchDataCssModule: OverrideMatchDataCssNamespace.IOverrideMatchDataCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OverrideMatchDataCssNamespace.IOverrideMatchDataCss;
};

export = OverrideMatchDataCssModule;
