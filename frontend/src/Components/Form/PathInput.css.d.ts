declare namespace PathInputCssNamespace {
  export interface IPathInputCss {
    fileBrowserButton: string;
    fileBrowserMiddleButton: string;
    hasFileBrowser: string;
    inputWrapper: string;
    pathMatch: string;
  }
}

declare const PathInputCssModule: PathInputCssNamespace.IPathInputCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: PathInputCssNamespace.IPathInputCss;
};

export = PathInputCssModule;
