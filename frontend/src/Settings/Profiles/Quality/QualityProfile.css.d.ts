declare namespace QualityProfileCssNamespace {
  export interface IQualityProfileCss {
    cloneButton: string;
    fallback: string;
    name: string;
    nameContainer: string;
    qualities: string;
    qualityProfile: string;
    tooltipLabel: string;
  }
}

declare const QualityProfileCssModule: QualityProfileCssNamespace.IQualityProfileCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileCssNamespace.IQualityProfileCss;
};

export = QualityProfileCssModule;
