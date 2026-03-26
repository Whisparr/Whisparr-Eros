declare namespace ReleaseProfileItemCssNamespace {
  export interface IReleaseProfileItemCss {
    enabled: string;
    label: string;
    name: string;
    releaseProfile: string;
  }
}

declare const ReleaseProfileItemCssModule: ReleaseProfileItemCssNamespace.IReleaseProfileItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ReleaseProfileItemCssNamespace.IReleaseProfileItemCss;
};

export = ReleaseProfileItemCssModule;
