declare namespace DelayProfileDragSourceCssNamespace {
  export interface IDelayProfileDragSourceCss {
    delayProfileDragSource: string;
    delayProfilePlaceholder: string;
    delayProfilePlaceholderAfter: string;
    delayProfilePlaceholderBefore: string;
  }
}

declare const DelayProfileDragSourceCssModule: DelayProfileDragSourceCssNamespace.IDelayProfileDragSourceCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DelayProfileDragSourceCssNamespace.IDelayProfileDragSourceCss;
};

export = DelayProfileDragSourceCssModule;
