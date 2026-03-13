declare namespace RelativeDateCellCssNamespace {
  export interface IRelativeDateCellCss {
    cell: string;
  }
}

declare const RelativeDateCellCssModule: RelativeDateCellCssNamespace.IRelativeDateCellCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: RelativeDateCellCssNamespace.IRelativeDateCellCss;
};

export = RelativeDateCellCssModule;
