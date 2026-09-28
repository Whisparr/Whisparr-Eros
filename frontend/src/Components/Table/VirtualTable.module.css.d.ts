declare namespace VirtualTableModuleCssNamespace {
  export interface IVirtualTableModuleCss {
    tableBodyContainer: string;
    tableContainer: string;
  }
}

declare const VirtualTableModuleCssModule: VirtualTableModuleCssNamespace.IVirtualTableModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableModuleCssNamespace.IVirtualTableModuleCss;
};

export = VirtualTableModuleCssModule;
