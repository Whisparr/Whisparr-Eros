declare namespace PathInputModuleCssNamespace {
  export interface IPathInputModuleCss {
    fileBrowserButton: string;
    fileBrowserMiddleButton: string;
    hasFileBrowser: string;
    inputWrapper: string;
    pathMatch: string;
  }
}

declare const PathInputModuleCssModule: PathInputModuleCssNamespace.IPathInputModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PathInputModuleCssNamespace.IPathInputModuleCss;
};

export = PathInputModuleCssModule;
