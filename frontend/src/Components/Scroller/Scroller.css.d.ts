declare namespace ScrollerCssNamespace {
  export interface IScrollerCss {
    autoScroll: string;
    both: string;
    horizontal: string;
    none: string;
    scroller: string;
    vertical: string;
  }
}

declare const ScrollerCssModule: ScrollerCssNamespace.IScrollerCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ScrollerCssNamespace.IScrollerCss;
};

export = ScrollerCssModule;
