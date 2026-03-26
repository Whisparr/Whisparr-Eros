declare namespace DiskSpaceCssNamespace {
  export interface IDiskSpaceCss {
    space: string;
  }
}

declare const DiskSpaceCssModule: DiskSpaceCssNamespace.IDiskSpaceCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DiskSpaceCssNamespace.IDiskSpaceCss;
};

export = DiskSpaceCssModule;
