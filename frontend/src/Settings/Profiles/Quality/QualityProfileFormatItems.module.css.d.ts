declare namespace QualityProfileFormatItemsModuleCssNamespace {
  export interface IQualityProfileFormatItemsModuleCss {
    addCustomFormatMessage: string;
    formats: string;
    headerContainer: string;
    headerScore: string;
    headerTitle: string;
  }
}

declare const QualityProfileFormatItemsModuleCssModule: QualityProfileFormatItemsModuleCssNamespace.IQualityProfileFormatItemsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileFormatItemsModuleCssNamespace.IQualityProfileFormatItemsModuleCss;
};

export = QualityProfileFormatItemsModuleCssModule;
