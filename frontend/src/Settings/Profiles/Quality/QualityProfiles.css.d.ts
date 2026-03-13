declare namespace QualityProfilesCssNamespace {
  export interface IQualityProfilesCss {
    addQualityProfile: string;
    center: string;
    qualityProfiles: string;
  }
}

declare const QualityProfilesCssModule: QualityProfilesCssNamespace.IQualityProfilesCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfilesCssNamespace.IQualityProfilesCss;
};

export = QualityProfilesCssModule;
