declare namespace StudioIndexCssNamespace {
  export interface IStudioIndexCss {
    contentBody: string;
    contentBodyContainer: string;
    errorMessage: string;
    pageContent: string;
    pageContentBodyWrapper: string;
    postersInnerContentBody: string;
    tableInnerContentBody: string;
  }
}

declare const StudioIndexCssModule: StudioIndexCssNamespace.IStudioIndexCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexCssNamespace.IStudioIndexCss;
};

export = StudioIndexCssModule;
