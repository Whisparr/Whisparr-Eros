declare namespace PerformerIndexCssNamespace {
  export interface IPerformerIndexCss {
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

declare const PerformerIndexCssModule: PerformerIndexCssNamespace.IPerformerIndexCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PerformerIndexCssNamespace.IPerformerIndexCss;
};

export = PerformerIndexCssModule;
