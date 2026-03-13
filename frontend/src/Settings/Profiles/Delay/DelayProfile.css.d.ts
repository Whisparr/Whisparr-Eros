declare namespace DelayProfileCssNamespace {
  export interface IDelayProfileCss {
    actions: string;
    column: string;
    delayProfile: string;
    dragHandle: string;
    dragIcon: string;
    editButton: string;
    isDragging: string;
  }
}

declare const DelayProfileCssModule: DelayProfileCssNamespace.IDelayProfileCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DelayProfileCssNamespace.IDelayProfileCss;
};

export = DelayProfileCssModule;
