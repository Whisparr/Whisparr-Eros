declare namespace QualityDefinitionModuleCssNamespace {
  export interface IQualityDefinitionModuleCss {
    megabytesPerMinute: string;
    quality: string;
    qualityDefinition: string;
    sizeInput: string;
    sizeLimit: string;
    sizes: string;
    slider: string;
    thumb: string;
    title: string;
    track: string;
  }
}

declare const QualityDefinitionModuleCssModule: QualityDefinitionModuleCssNamespace.IQualityDefinitionModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityDefinitionModuleCssNamespace.IQualityDefinitionModuleCss;
};

export = QualityDefinitionModuleCssModule;
