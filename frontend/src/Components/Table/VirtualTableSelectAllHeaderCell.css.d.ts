declare namespace VirtualTableSelectAllHeaderCellCssNamespace {
  export interface IVirtualTableSelectAllHeaderCellCss {
    input: string;
    selectAllHeaderCell: string;
  }
}

declare const VirtualTableSelectAllHeaderCellCssModule: VirtualTableSelectAllHeaderCellCssNamespace.IVirtualTableSelectAllHeaderCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableSelectAllHeaderCellCssNamespace.IVirtualTableSelectAllHeaderCellCss;
};

export = VirtualTableSelectAllHeaderCellCssModule;
