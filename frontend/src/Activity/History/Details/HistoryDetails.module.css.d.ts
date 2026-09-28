declare namespace HistoryDetailsModuleCssNamespace {
  export interface IHistoryDetailsModuleCss {
    description: string;
  }
}

declare const HistoryDetailsModuleCssModule: HistoryDetailsModuleCssNamespace.IHistoryDetailsModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: HistoryDetailsModuleCssNamespace.IHistoryDetailsModuleCss;
};

export = HistoryDetailsModuleCssModule;
