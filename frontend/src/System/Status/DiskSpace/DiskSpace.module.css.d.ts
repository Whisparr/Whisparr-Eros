declare namespace DiskSpaceModuleCssNamespace {
  export interface IDiskSpaceModuleCss {
    space: string;
  }
}

declare const DiskSpaceModuleCssModule: DiskSpaceModuleCssNamespace.IDiskSpaceModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DiskSpaceModuleCssNamespace.IDiskSpaceModuleCss;
};

export = DiskSpaceModuleCssModule;
