declare namespace VirtualTableSelectCellCssNamespace {
  export interface IVirtualTableSelectCellCss {
    cell: string;
    input: string;
  }
}

declare const VirtualTableSelectCellCssModule: VirtualTableSelectCellCssNamespace.IVirtualTableSelectCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableSelectCellCssNamespace.IVirtualTableSelectCellCss;
};

export = VirtualTableSelectCellCssModule;
