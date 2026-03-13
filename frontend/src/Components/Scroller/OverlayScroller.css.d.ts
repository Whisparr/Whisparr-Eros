declare namespace OverlayScrollerCssNamespace {
  export interface IOverlayScrollerCss {
    scroller: string;
    thumb: string;
    track: string;
  }
}

declare const OverlayScrollerCssModule: OverlayScrollerCssNamespace.IOverlayScrollerCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: OverlayScrollerCssNamespace.IOverlayScrollerCss;
};

export = OverlayScrollerCssModule;
