declare namespace ReleaseProfilesModuleCssNamespace {
  export interface IReleaseProfilesModuleCss {
    addReleaseProfile: string;
    center: string;
    releaseProfiles: string;
  }
}

declare const ReleaseProfilesModuleCssModule: ReleaseProfilesModuleCssNamespace.IReleaseProfilesModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ReleaseProfilesModuleCssNamespace.IReleaseProfilesModuleCss;
};

export = ReleaseProfilesModuleCssModule;
