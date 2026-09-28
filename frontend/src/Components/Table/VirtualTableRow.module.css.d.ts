declare namespace VirtualTableRowModuleCssNamespace {
  export interface IVirtualTableRowModuleCss {
    row: string;
  }
}

declare const VirtualTableRowModuleCssModule: VirtualTableRowModuleCssNamespace.IVirtualTableRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableRowModuleCssNamespace.IVirtualTableRowModuleCss;
};

export = VirtualTableRowModuleCssModule;
