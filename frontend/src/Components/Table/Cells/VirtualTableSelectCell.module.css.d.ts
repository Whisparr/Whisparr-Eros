declare namespace VirtualTableSelectCellModuleCssNamespace {
  export interface IVirtualTableSelectCellModuleCss {
    cell: string;
    input: string;
  }
}

declare const VirtualTableSelectCellModuleCssModule: VirtualTableSelectCellModuleCssNamespace.IVirtualTableSelectCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableSelectCellModuleCssNamespace.IVirtualTableSelectCellModuleCss;
};

export = VirtualTableSelectCellModuleCssModule;
