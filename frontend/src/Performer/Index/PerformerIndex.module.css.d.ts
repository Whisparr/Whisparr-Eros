declare namespace PerformerIndexModuleCssNamespace {
  export interface IPerformerIndexModuleCss {
    contentBody: string;
    contentBodyContainer: string;
    errorMessage: string;
    pageContent: string;
    pageContentBodyWrapper: string;
    performerIndexTable: string;
    postersInnerContentBody: string;
    tableInnerContentBody: string;
    tablePager: string;
  }
}

declare const PerformerIndexModuleCssModule: PerformerIndexModuleCssNamespace.IPerformerIndexModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexModuleCssNamespace.IPerformerIndexModuleCss;
};

export = PerformerIndexModuleCssModule;
