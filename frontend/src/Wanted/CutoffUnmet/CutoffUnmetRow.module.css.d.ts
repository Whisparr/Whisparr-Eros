declare namespace CutoffUnmetRowModuleCssNamespace {
  export interface ICutoffUnmetRowModuleCss {
    status: string;
  }
}

declare const CutoffUnmetRowModuleCssModule: CutoffUnmetRowModuleCssNamespace.ICutoffUnmetRowModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CutoffUnmetRowModuleCssNamespace.ICutoffUnmetRowModuleCss;
};

export = CutoffUnmetRowModuleCssModule;
