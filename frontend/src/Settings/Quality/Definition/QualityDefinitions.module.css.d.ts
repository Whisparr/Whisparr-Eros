declare namespace QualityDefinitionsModuleCssNamespace {
  export interface IQualityDefinitionsModuleCss {
    definitions: string;
    header: string;
    megabytesPerMinute: string;
    quality: string;
    sizeLimit: string;
    sizeLimitHelpText: string;
    sizeLimitHelpTextContainer: string;
    title: string;
  }
}

declare const QualityDefinitionsModuleCssModule: QualityDefinitionsModuleCssNamespace.IQualityDefinitionsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityDefinitionsModuleCssNamespace.IQualityDefinitionsModuleCss;
};

export = QualityDefinitionsModuleCssModule;
