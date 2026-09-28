declare namespace YearInfoModuleCssNamespace {
  export interface IYearInfoModuleCss {
    description: string;
    title: string;
  }
}

declare const YearInfoModuleCssModule: YearInfoModuleCssNamespace.IYearInfoModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: YearInfoModuleCssNamespace.IYearInfoModuleCss;
};

export = YearInfoModuleCssModule;
