declare namespace OverlayScrollerModuleCssNamespace {
  export interface IOverlayScrollerModuleCss {
    scroller: string;
    thumb: string;
    track: string;
  }
}

declare const OverlayScrollerModuleCssModule: OverlayScrollerModuleCssNamespace.IOverlayScrollerModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OverlayScrollerModuleCssNamespace.IOverlayScrollerModuleCss;
};

export = OverlayScrollerModuleCssModule;
