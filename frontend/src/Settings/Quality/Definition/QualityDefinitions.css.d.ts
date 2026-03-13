declare namespace QualityDefinitionsCssNamespace {
  export interface IQualityDefinitionsCss {
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

declare const QualityDefinitionsCssModule: QualityDefinitionsCssNamespace.IQualityDefinitionsCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityDefinitionsCssNamespace.IQualityDefinitionsCss;
};

export = QualityDefinitionsCssModule;
