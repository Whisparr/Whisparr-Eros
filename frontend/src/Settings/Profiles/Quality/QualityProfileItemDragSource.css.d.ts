declare namespace QualityProfileItemDragSourceCssNamespace {
  export interface IQualityProfileItemDragSourceCss {
    qualityProfileItemDragSource: string;
    qualityProfileItemPlaceholder: string;
    qualityProfileItemPlaceholderAfter: string;
    qualityProfileItemPlaceholderBefore: string;
  }
}

declare const QualityProfileItemDragSourceCssModule: QualityProfileItemDragSourceCssNamespace.IQualityProfileItemDragSourceCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileItemDragSourceCssNamespace.IQualityProfileItemDragSourceCss;
};

export = QualityProfileItemDragSourceCssModule;
