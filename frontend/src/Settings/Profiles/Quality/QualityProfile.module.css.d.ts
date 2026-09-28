declare namespace QualityProfileModuleCssNamespace {
  export interface IQualityProfileModuleCss {
    cloneButton: string;
    fallback: string;
    name: string;
    nameContainer: string;
    qualities: string;
    qualityProfile: string;
    tooltipLabel: string;
  }
}

declare const QualityProfileModuleCssModule: QualityProfileModuleCssNamespace.IQualityProfileModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileModuleCssNamespace.IQualityProfileModuleCss;
};

export = QualityProfileModuleCssModule;
