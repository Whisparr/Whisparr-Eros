declare namespace VirtualTableRowCellCssNamespace {
  export interface IVirtualTableRowCellCss {
    cell: string;
  }
}

declare const VirtualTableRowCellCssModule: VirtualTableRowCellCssNamespace.IVirtualTableRowCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableRowCellCssNamespace.IVirtualTableRowCellCss;
};

export = VirtualTableRowCellCssModule;
