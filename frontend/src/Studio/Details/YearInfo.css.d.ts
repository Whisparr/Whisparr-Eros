declare namespace YearInfoCssNamespace {
  export interface IYearInfoCss {
    description: string;
    title: string;
  }
}

declare const YearInfoCssModule: YearInfoCssNamespace.IYearInfoCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: YearInfoCssNamespace.IYearInfoCss;
};

export = YearInfoCssModule;
