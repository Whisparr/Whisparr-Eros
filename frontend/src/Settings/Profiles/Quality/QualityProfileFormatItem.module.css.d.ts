declare namespace QualityProfileFormatItemModuleCssNamespace {
  export interface IQualityProfileFormatItemModuleCss {
    formatName: string;
    formatNameContainer: string;
    qualityProfileFormatItem: string;
    qualityProfileFormatItemContainer: string;
    scoreContainer: string;
    scoreInput: string;
  }
}

declare const QualityProfileFormatItemModuleCssModule: QualityProfileFormatItemModuleCssNamespace.IQualityProfileFormatItemModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileFormatItemModuleCssNamespace.IQualityProfileFormatItemModuleCss;
};

export = QualityProfileFormatItemModuleCssModule;
