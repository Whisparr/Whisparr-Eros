declare namespace VirtualTableRowCellModuleCssNamespace {
  export interface IVirtualTableRowCellModuleCss {
    cell: string;
  }
}

declare const VirtualTableRowCellModuleCssModule: VirtualTableRowCellModuleCssNamespace.IVirtualTableRowCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableRowCellModuleCssNamespace.IVirtualTableRowCellModuleCss;
};

export = VirtualTableRowCellModuleCssModule;
