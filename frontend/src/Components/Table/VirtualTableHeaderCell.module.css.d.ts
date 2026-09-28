declare namespace VirtualTableHeaderCellModuleCssNamespace {
  export interface IVirtualTableHeaderCellModuleCss {
    headerCell: string;
    sortIcon: string;
  }
}

declare const VirtualTableHeaderCellModuleCssModule: VirtualTableHeaderCellModuleCssNamespace.IVirtualTableHeaderCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableHeaderCellModuleCssNamespace.IVirtualTableHeaderCellModuleCss;
};

export = VirtualTableHeaderCellModuleCssModule;
