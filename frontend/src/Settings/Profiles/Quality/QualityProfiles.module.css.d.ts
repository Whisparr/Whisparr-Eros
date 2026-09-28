declare namespace QualityProfilesModuleCssNamespace {
  export interface IQualityProfilesModuleCss {
    addQualityProfile: string;
    center: string;
    qualityProfiles: string;
  }
}

declare const QualityProfilesModuleCssModule: QualityProfilesModuleCssNamespace.IQualityProfilesModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfilesModuleCssNamespace.IQualityProfilesModuleCss;
};

export = QualityProfilesModuleCssModule;
