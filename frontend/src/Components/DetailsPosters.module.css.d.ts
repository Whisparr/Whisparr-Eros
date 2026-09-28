declare namespace DetailsPostersModuleCssNamespace {
  export interface IDetailsPostersModuleCss {
    row: string;
  }
}

declare const DetailsPostersModuleCssModule: DetailsPostersModuleCssNamespace.IDetailsPostersModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: DetailsPostersModuleCssNamespace.IDetailsPostersModuleCss;
};

export = DetailsPostersModuleCssModule;
