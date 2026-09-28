declare namespace RelativeDateCellModuleCssNamespace {
  export interface IRelativeDateCellModuleCss {
    cell: string;
  }
}

declare const RelativeDateCellModuleCssModule: RelativeDateCellModuleCssNamespace.IRelativeDateCellModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RelativeDateCellModuleCssNamespace.IRelativeDateCellModuleCss;
};

export = RelativeDateCellModuleCssModule;
