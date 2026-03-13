declare namespace CutoffUnmetRowCssNamespace {
  export interface ICutoffUnmetRowCss {
    status: string;
  }
}

declare const CutoffUnmetRowCssModule: CutoffUnmetRowCssNamespace.ICutoffUnmetRowCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CutoffUnmetRowCssNamespace.ICutoffUnmetRowCss;
};

export = CutoffUnmetRowCssModule;
