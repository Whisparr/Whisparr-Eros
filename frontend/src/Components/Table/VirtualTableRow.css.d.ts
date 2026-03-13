declare namespace VirtualTableRowCssNamespace {
  export interface IVirtualTableRowCss {
    row: string;
  }
}

declare const VirtualTableRowCssModule: VirtualTableRowCssNamespace.IVirtualTableRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableRowCssNamespace.IVirtualTableRowCss;
};

export = VirtualTableRowCssModule;
