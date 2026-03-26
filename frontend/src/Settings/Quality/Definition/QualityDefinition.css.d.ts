declare namespace QualityDefinitionCssNamespace {
  export interface IQualityDefinitionCss {
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

declare const QualityDefinitionCssModule: QualityDefinitionCssNamespace.IQualityDefinitionCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityDefinitionCssNamespace.IQualityDefinitionCss;
};

export = QualityDefinitionCssModule;
