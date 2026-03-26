declare namespace QualityProfileFormatItemCssNamespace {
  export interface IQualityProfileFormatItemCss {
    formatName: string;
    formatNameContainer: string;
    qualityProfileFormatItem: string;
    qualityProfileFormatItemContainer: string;
    scoreContainer: string;
    scoreInput: string;
  }
}

declare const QualityProfileFormatItemCssModule: QualityProfileFormatItemCssNamespace.IQualityProfileFormatItemCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileFormatItemCssNamespace.IQualityProfileFormatItemCss;
};

export = QualityProfileFormatItemCssModule;
