declare namespace QualityProfileItemDragPreviewCssNamespace {
  export interface IQualityProfileItemDragPreviewCss {
    dragPreview: string;
  }
}

declare const QualityProfileItemDragPreviewCssModule: QualityProfileItemDragPreviewCssNamespace.IQualityProfileItemDragPreviewCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: QualityProfileItemDragPreviewCssNamespace.IQualityProfileItemDragPreviewCss;
};

export = QualityProfileItemDragPreviewCssModule;
