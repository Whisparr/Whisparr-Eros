declare namespace VirtualTableRowButtonCssNamespace {
  export interface IVirtualTableRowButtonCss {
    row: string;
  }
}

declare const VirtualTableRowButtonCssModule: VirtualTableRowButtonCssNamespace.IVirtualTableRowButtonCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableRowButtonCssNamespace.IVirtualTableRowButtonCss;
};

export = VirtualTableRowButtonCssModule;
