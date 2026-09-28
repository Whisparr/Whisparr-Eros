declare namespace VirtualTableRowButtonModuleCssNamespace {
  export interface IVirtualTableRowButtonModuleCss {
    row: string;
  }
}

declare const VirtualTableRowButtonModuleCssModule: VirtualTableRowButtonModuleCssNamespace.IVirtualTableRowButtonModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: VirtualTableRowButtonModuleCssNamespace.IVirtualTableRowButtonModuleCss;
};

export = VirtualTableRowButtonModuleCssModule;
