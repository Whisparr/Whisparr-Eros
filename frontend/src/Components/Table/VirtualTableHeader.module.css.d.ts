declare namespace VirtualTableHeaderModuleCssNamespace {
  export interface IVirtualTableHeaderModuleCss {
    header: string;
  }
}

declare const VirtualTableHeaderModuleCssModule: VirtualTableHeaderModuleCssNamespace.IVirtualTableHeaderModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableHeaderModuleCssNamespace.IVirtualTableHeaderModuleCss;
};

export = VirtualTableHeaderModuleCssModule;
