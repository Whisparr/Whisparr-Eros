declare namespace DelayProfileModuleCssNamespace {
  export interface IDelayProfileModuleCss {
    actions: string;
    column: string;
    container: string;
    delayProfile: string;
    dragHandle: string;
    dragIcon: string;
    editButton: string;
    isDragging: string;
  }
}

declare const DelayProfileModuleCssModule: DelayProfileModuleCssNamespace.IDelayProfileModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DelayProfileModuleCssNamespace.IDelayProfileModuleCss;
};

export = DelayProfileModuleCssModule;
