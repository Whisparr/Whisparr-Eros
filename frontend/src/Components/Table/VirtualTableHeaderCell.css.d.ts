declare namespace VirtualTableHeaderCellCssNamespace {
  export interface IVirtualTableHeaderCellCss {
    headerCell: string;
    sortIcon: string;
  }
}

declare const VirtualTableHeaderCellCssModule: VirtualTableHeaderCellCssNamespace.IVirtualTableHeaderCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableHeaderCellCssNamespace.IVirtualTableHeaderCellCss;
};

export = VirtualTableHeaderCellCssModule;
