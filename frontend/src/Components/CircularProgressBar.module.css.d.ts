declare namespace CircularProgressBarModuleCssNamespace {
  export interface ICircularProgressBarModuleCss {
    circularProgressBar: string;
    circularProgressBarContainer: string;
    circularProgressBarText: string;
  }
}

declare const CircularProgressBarModuleCssModule: CircularProgressBarModuleCssNamespace.ICircularProgressBarModuleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: CircularProgressBarModuleCssNamespace.ICircularProgressBarModuleCss;
};

export = CircularProgressBarModuleCssModule;
