declare namespace StudioIndexModuleCssNamespace {
  export interface IStudioIndexModuleCss {
    contentBody: string;
    contentBodyContainer: string;
    errorMessage: string;
    pageContent: string;
    pageContentBodyWrapper: string;
    postersInnerContentBody: string;
    tableInnerContentBody: string;
  }
}

declare const StudioIndexModuleCssModule: StudioIndexModuleCssNamespace.IStudioIndexModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StudioIndexModuleCssNamespace.IStudioIndexModuleCss;
};

export = StudioIndexModuleCssModule;
