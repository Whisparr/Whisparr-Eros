declare namespace ReleaseProfilesCssNamespace {
  export interface IReleaseProfilesCss {
    addReleaseProfile: string;
    center: string;
    releaseProfiles: string;
  }
}

declare const ReleaseProfilesCssModule: ReleaseProfilesCssNamespace.IReleaseProfilesCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ReleaseProfilesCssNamespace.IReleaseProfilesCss;
};

export = ReleaseProfilesCssModule;
