declare namespace DelayProfileDragPreviewCssNamespace {
  export interface IDelayProfileDragPreviewCss {
    dragPreview: string;
  }
}

declare const DelayProfileDragPreviewCssModule: DelayProfileDragPreviewCssNamespace.IDelayProfileDragPreviewCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DelayProfileDragPreviewCssNamespace.IDelayProfileDragPreviewCss;
};

export = DelayProfileDragPreviewCssModule;
