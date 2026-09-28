declare namespace ReleaseProfileItemModuleCssNamespace {
  export interface IReleaseProfileItemModuleCss {
    enabled: string;
    label: string;
    name: string;
    releaseProfile: string;
  }
}

declare const ReleaseProfileItemModuleCssModule: ReleaseProfileItemModuleCssNamespace.IReleaseProfileItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ReleaseProfileItemModuleCssNamespace.IReleaseProfileItemModuleCss;
};

export = ReleaseProfileItemModuleCssModule;
