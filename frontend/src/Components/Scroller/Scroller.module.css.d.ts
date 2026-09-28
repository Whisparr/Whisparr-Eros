declare namespace ScrollerModuleCssNamespace {
  export interface IScrollerModuleCss {
    autoScroll: string;
    both: string;
    horizontal: string;
    none: string;
    scroller: string;
    vertical: string;
  }
}

declare const ScrollerModuleCssModule: ScrollerModuleCssNamespace.IScrollerModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: ScrollerModuleCssNamespace.IScrollerModuleCss;
};

export = ScrollerModuleCssModule;
