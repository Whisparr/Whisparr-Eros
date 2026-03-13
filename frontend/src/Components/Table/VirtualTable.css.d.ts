declare namespace VirtualTableCssNamespace {
  export interface IVirtualTableCss {
    tableBodyContainer: string;
    tableContainer: string;
  }
}

declare const VirtualTableCssModule: VirtualTableCssNamespace.IVirtualTableCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableCssNamespace.IVirtualTableCss;
};

export = VirtualTableCssModule;
