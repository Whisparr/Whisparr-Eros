declare namespace VirtualTableHeaderCssNamespace {
  export interface IVirtualTableHeaderCss {
    header: string;
  }
}

declare const VirtualTableHeaderCssModule: VirtualTableHeaderCssNamespace.IVirtualTableHeaderCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableHeaderCssNamespace.IVirtualTableHeaderCss;
};

export = VirtualTableHeaderCssModule;
