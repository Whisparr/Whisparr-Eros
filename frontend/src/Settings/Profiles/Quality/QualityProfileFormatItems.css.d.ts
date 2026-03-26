declare namespace QualityProfileFormatItemsCssNamespace {
  export interface IQualityProfileFormatItemsCss {
    addCustomFormatMessage: string;
    formats: string;
    headerContainer: string;
    headerScore: string;
    headerTitle: string;
  }
}

declare const QualityProfileFormatItemsCssModule: QualityProfileFormatItemsCssNamespace.IQualityProfileFormatItemsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileFormatItemsCssNamespace.IQualityProfileFormatItemsCss;
};

export = QualityProfileFormatItemsCssModule;
